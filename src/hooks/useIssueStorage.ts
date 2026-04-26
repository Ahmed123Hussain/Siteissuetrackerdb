import { useState, useCallback, useEffect } from 'react';
import { Issue } from '../types/index';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'elv_issues';

export const useIssueStorage = () => {
  const [issues, setIssues] = useState<Issue[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Normalize rows from Supabase to ensure required fields exist
  const normalizeIssue = (row: any): Issue => {
    const pick = (r: any, camel: string, snake: string) => r?.[camel] ?? r?.[snake];
    const pickObj = (r: any, camel: string, snake: string) => {
      const val = r?.[camel] ?? r?.[snake];
      return val;
    };
    const siteImg = pickObj(row, 'siteImage', 'site_image');
    const safeSiteImage = siteImg && typeof siteImg === 'object'
      ? {
          data: siteImg.data ?? '',
          filename: siteImg.filename ?? '',
          thumbnail: siteImg.thumbnail ?? '',
        }
      : undefined;

    const solImg = pickObj(row, 'solutionImage', 'solution_image');
    const safeSolutionImage = solImg && typeof solImg === 'object'
      ? {
          data: solImg.data ?? '',
          filename: solImg.filename ?? '',
          thumbnail: solImg.thumbnail ?? '',
        }
      : undefined;

    const issueNumberRaw = pick(row, 'issueNumber', 'issue_number');
    const createdAtRaw = pick(row, 'createdAt', 'created_at');
    const closedAtRaw = pick(row, 'closedAt', 'closed_at');
    const updatedAtRaw = pick(row, 'updatedAt', 'updated_at');

    return {
      id: row?.id ?? crypto.randomUUID(),
      issueNumber: typeof issueNumberRaw === 'number' ? issueNumberRaw : (issueNumberRaw ? Number(issueNumberRaw) : 0),
      location: row?.location ?? row?.location ?? '',
      description: row?.description ?? '',
      shopDrawing: (row?.shopDrawing ?? row?.shop_drawing) && typeof (row?.shopDrawing ?? row?.shop_drawing) === 'object'
        ? {
            data: (row?.shopDrawing ?? row?.shop_drawing).data ?? '',
            filename: (row?.shopDrawing ?? row?.shop_drawing).filename ?? '',
            thumbnail: (row?.shopDrawing ?? row?.shop_drawing).thumbnail ?? '',
          }
        : { data: '', filename: '', thumbnail: '' },
      siteImage: safeSiteImage,
      solutionImage: safeSolutionImage,
      status: row?.status ?? 'Open',
      solution: row?.solution ?? undefined,
      createdAt: createdAtRaw ?? new Date().toISOString(),
      closedAt: closedAtRaw ?? undefined,
      updatedAt: updatedAtRaw ?? (createdAtRaw ?? new Date().toISOString()),
    };
  };

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    (async () => {
      let data: any = null;
      let error: any = null;

      const tryOrder = async (col: string) => {
        const res = await supabase.from('issues').select('*').order(col, { ascending: false });
        return res;
      };

      // Try snake_case first, then camelCase as a fallback
      ({ data, error } = await tryOrder('created_at'));
      if (error && String(error?.code) === 'PGRST204') {
        console.warn('created_at not found, retrying fetch with createdAt');
        ({ data, error } = await tryOrder('createdAt'));
      }

      if (error) {
        console.error('Supabase fetch error:', error);
        return;
      }

      if (mounted && data) {
        setIssues((data as any[]).map(normalizeIssue));
      }
    })();

    const channel = supabase
      .channel('public:issues')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'issues' }, (payload) => {
        const newRow = normalizeIssue(payload.new);
        setIssues(prev => [newRow, ...prev.filter(i => i.id !== newRow.id)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'issues' }, (payload) => {
        const updated = normalizeIssue(payload.new);
        setIssues(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'issues' }, (payload) => {
        const deleted = normalizeIssue(payload.old);
        setIssues(prev => prev.filter(i => i.id !== deleted.id));
      })
      .subscribe();

    return () => {
      mounted = false;
      try {
        // remove channel if supported
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        supabase.removeChannel?.(channel);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Persist to localStorage whenever issues change (keeps offline copy)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  const addIssue = useCallback(async (newIssue: Omit<Issue, 'id' | 'issueNumber'>) => {
    if (!supabase) {
      const issueNumber = issues.length > 0 ? Math.max(...issues.map(i => i.issueNumber)) + 1 : 1;
      const issue: Issue = {
        ...newIssue,
        id: crypto.randomUUID(),
        issueNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setIssues(prev => [issue, ...prev]);
      return issue;
    }

    const issueNumber = issues.length > 0 ? Math.max(...issues.map(i => i.issueNumber)) + 1 : 1;
    const toInsert = {
      ...newIssue,
      id: crypto.randomUUID(),
      issueNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

      try {
      // Convert top-level camelCase keys to snake_case for the DB (leave nested objects as-is)
      const toSnake = (s: string) => s.replace(/([A-Z])/g, m => '_' + m.toLowerCase()).replace(/^_/, '');
      const convertTopLevelToSnake = (obj: Record<string, any>) =>
        Object.fromEntries(
          Object.entries(obj)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [toSnake(k), v])
        );

      const snakePayload: any = convertTopLevelToSnake(toInsert);

      let res = await supabase.from('issues').insert([snakePayload]).select().single();
      let { data, error } = res;

      // If server complains about missing snake_case columns, retry with camelCase payload
      if (error && String(error?.code) === 'PGRST204') {
        console.warn('Supabase reported missing snake_case column, retrying insert with camelCase payload');
        console.error('Supabase insert error (first):', error);
        console.error('Insert payload (sent, snake):', snakePayload);
        res = await supabase.from('issues').insert([toInsert]).select().single();
        data = res.data; error = res.error;
        console.error('Insert payload (retry, camel):', toInsert);
      }

      if (error) {
        try {
          console.error('Supabase insert error:', JSON.stringify(error, null, 2));
        } catch (e) {
          console.error('Supabase insert error (raw):', error);
        }
        console.error('Insert payload (original):', toInsert);
        console.error('Insert payload (sent):', snakePayload);
        const local = normalizeIssue(toInsert);
        setIssues(prev => [local, ...prev]);
        return local;
      }
      return normalizeIssue(data);
    } catch (e: any) {
      console.error('Supabase insert exception:', e?.message ?? e, e);
      console.error('Insert payload:', toInsert);
      const local = normalizeIssue(toInsert);
      setIssues(prev => [local, ...prev]);
      return local;
    }
  }, [issues]);

  const updateIssue = useCallback(async (issueId: string, updates: Partial<Issue>) => {
    const updatedAt = new Date().toISOString();
    if (!supabase) {
      setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, ...updates, updatedAt } : issue));
      return;
    }

    try {
      const updatePayload = { ...updates, updatedAt } as any;
      const toSnake = (s: string) => s.replace(/([A-Z])/g, m => '_' + m.toLowerCase()).replace(/^_/, '');
      const convertTopLevelToSnake = (obj: Record<string, any>) =>
        Object.fromEntries(
          Object.entries(obj)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [toSnake(k), v])
        );

      const lowerUpdatePayload = convertTopLevelToSnake(updatePayload);

      let res = await supabase.from('issues').update(lowerUpdatePayload).eq('id', issueId).select().single();
      let { data, error } = res;

      if (error && String(error?.code) === 'PGRST204') {
        console.warn('Supabase reported missing snake_case column, retrying update with camelCase payload');
        console.error('Supabase update error (first):', error);
        console.error('Update payload (sent, snake):', lowerUpdatePayload);
        res = await supabase.from('issues').update(updatePayload).eq('id', issueId).select().single();
        data = res.data; error = res.error;
        console.error('Update payload (retry, camel):', updatePayload);
      }

      if (error) {
        console.error('Supabase update error:', error);
        console.error('Update payload:', { issueId, updates: { ...updates, updatedAt } });
        setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, ...updates, updatedAt } : issue));
        return;
      }

      const normalized = normalizeIssue(data);
      setIssues(prev => prev.map(issue => issue.id === issueId ? normalized : issue));
    } catch (e: any) {
      console.error('Supabase update exception:', e?.message ?? e, e);
      console.error('Update payload:', { issueId, updates: { ...updates, updatedAt } });
      setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, ...updates, updatedAt } : issue));
      return;
    }
  }, [issues]);

  const deleteIssue = useCallback(async (issueId: string) => {
    if (!supabase) {
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      return;
    }

    const { error } = await supabase.from('issues').delete().eq('id', issueId);
    if (error) {
      console.error('Supabase delete error:', error);
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
    }
  }, []);

  return {
    issues,
    addIssue,
    updateIssue,
    deleteIssue,
  };
};

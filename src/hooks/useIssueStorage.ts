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
    const safeShopDrawing = row?.shopDrawing && typeof row.shopDrawing === 'object'
      ? {
          data: row.shopDrawing.data ?? '',
          filename: row.shopDrawing.filename ?? '',
          thumbnail: row.shopDrawing.thumbnail ?? '',
        }
      : { data: '', filename: '', thumbnail: '' };

    const safeSiteImage = row?.siteImage && typeof row.siteImage === 'object'
      ? {
          data: row.siteImage.data ?? '',
          filename: row.siteImage.filename ?? '',
          thumbnail: row.siteImage.thumbnail ?? '',
        }
      : undefined;

    return {
      id: row?.id ?? crypto.randomUUID(),
      issueNumber: typeof row?.issueNumber === 'number' ? row.issueNumber : (row?.issueNumber ? Number(row.issueNumber) : 0),
      location: row?.location ?? '',
      description: row?.description ?? '',
      shopDrawing: safeShopDrawing,
      siteImage: safeSiteImage,
      status: row?.status ?? 'Open',
      solution: row?.solution ?? undefined,
      createdAt: row?.createdAt ?? new Date().toISOString(),
      closedAt: row?.closedAt ?? undefined,
      updatedAt: row?.updatedAt ?? (row?.createdAt ?? new Date().toISOString()),
    };
  };

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('createdAt', { ascending: false });

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

    const { data, error } = await supabase.from('issues').insert(toInsert).select().single();
    if (error) {
      console.error('Supabase insert error:', error);
      // fallback to local
      const local = normalizeIssue(toInsert);
      setIssues(prev => [local, ...prev]);
      return local;
    }

    return normalizeIssue(data);
  }, [issues]);

  const updateIssue = useCallback(async (issueId: string, updates: Partial<Issue>) => {
    const updatedAt = new Date().toISOString();
    if (!supabase) {
      setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, ...updates, updatedAt } : issue));
      return;
    }

    const { data, error } = await supabase.from('issues').update({ ...updates, updatedAt }).eq('id', issueId).select().single();
    if (error) {
      console.error('Supabase update error:', error);
      setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, ...updates, updatedAt } : issue));
      return;
    }

    const normalized = normalizeIssue(data);
    setIssues(prev => prev.map(issue => issue.id === issueId ? normalized : issue));
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

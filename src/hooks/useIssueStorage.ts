import { useState, useCallback, useEffect } from 'react';
import { Issue } from '../types/index';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'elv_issues';

export const useIssueStorage = () => {
  const [issues, setIssues] = useState<Issue[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ Clean normalization (camelCase only)
  const normalizeIssue = (row: any): Issue => {
    const safeShopDrawing =
      row?.shopDrawing && typeof row.shopDrawing === 'object'
        ? {
            data: row.shopDrawing.data ?? '',
            filename: row.shopDrawing.filename ?? '',
            thumbnail: row.shopDrawing.thumbnail ?? '',
          }
        : { data: '', filename: '', thumbnail: '' };

    const safeSiteImage =
      row?.siteImage && typeof row.siteImage === 'object'
        ? {
            data: row.siteImage.data ?? '',
            filename: row.siteImage.filename ?? '',
            thumbnail: row.siteImage.thumbnail ?? '',
          }
        : undefined;

    const safeSolutionImage =
      row?.solutionImage && typeof row.solutionImage === 'object'
        ? {
            data: row.solutionImage.data ?? '',
            filename: row.solutionImage.filename ?? '',
            thumbnail: row.solutionImage.thumbnail ?? '',
          }
        : undefined;

    return {
      id: row?.id ?? crypto.randomUUID(),
      issueNumber:
        typeof row?.issueNumber === 'number'
          ? row.issueNumber
          : Number(row?.issueNumber ?? 0),
      location: row?.location ?? '',
      description: row?.description ?? '',
      shopDrawing: safeShopDrawing,
      siteImage: safeSiteImage,
      solutionImage: safeSolutionImage,
      status: row?.status ?? 'Open',
      solution: row?.solution ?? undefined,
      createdAt: row?.createdAt ?? new Date().toISOString(),
      closedAt: row?.closedAt ?? undefined,
      updatedAt:
        row?.updatedAt ?? row?.createdAt ?? new Date().toISOString(),
    };
  };

  // ✅ Fetch + realtime sync
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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issues' },
        (payload) => {
          const newRow = normalizeIssue(payload.new);
          setIssues((prev) => [
            newRow,
            ...prev.filter((i) => i.id !== newRow.id),
          ]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'issues' },
        (payload) => {
          const updated = normalizeIssue(payload.new);
          setIssues((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'issues' },
        (payload) => {
          const deletedId = payload.old?.id;
          setIssues((prev) =>
            prev.filter((i) => i.id !== deletedId)
          );
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        // @ts-ignore
        supabase.removeChannel?.(channel);
      } catch {}
    };
  }, []);

  // ✅ Persist locally
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  // ✅ Add Issue
  const addIssue = useCallback(
    async (newIssue: Omit<Issue, 'id' | 'issueNumber'>) => {
      const issueNumber =
        issues.length > 0
          ? Math.max(...issues.map((i) => i.issueNumber)) + 1
          : 1;

      const toInsert = {
        ...newIssue,
        id: crypto.randomUUID(),
        issueNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!supabase) {
        const local = normalizeIssue(toInsert);
        setIssues((prev) => [local, ...prev]);
        return local;
      }

      try {
        const { data, error } = await supabase
          .from('issues')
          .insert([toInsert])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          const local = normalizeIssue(toInsert);
          setIssues((prev) => [local, ...prev]);
          return local;
        }

        return normalizeIssue(data);
      } catch (e: any) {
        console.error('Insert exception:', e);
        const local = normalizeIssue(toInsert);
        setIssues((prev) => [local, ...prev]);
        return local;
      }
    },
    [issues]
  );

  // ✅ Update Issue
  const updateIssue = useCallback(
    async (issueId: string, updates: Partial<Issue>) => {
      const updatedAt = new Date().toISOString();
      const updatePayload = { ...updates, updatedAt };

      if (!supabase) {
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId ? { ...i, ...updatePayload } : i
          )
        );
        return;
      }

      try {
        const { data, error } = await supabase
          .from('issues')
          .update(updatePayload)
          .eq('id', issueId)
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          setIssues((prev) =>
            prev.map((i) =>
              i.id === issueId ? { ...i, ...updatePayload } : i
            )
          );
          return;
        }

        const normalized = normalizeIssue(data);
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId ? normalized : i
          )
        );
      } catch (e: any) {
        console.error('Update exception:', e);
      }
    },
    []
  );

  // ✅ Delete Issue (optimistic)
  const deleteIssue = useCallback(
    async (issueId: string) => {
      const backup = issues.find((i) => i.id === issueId);
      setIssues((prev) => prev.filter((i) => i.id !== issueId));

      if (!supabase) return;

      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (error) {
        console.error('Delete error:', error);
        if (backup) {
          setIssues((prev) => [backup, ...prev]);
        }
      }
    },
    [issues]
  );

  return {
    issues,
    addIssue,
    updateIssue,
    deleteIssue,
  };
};

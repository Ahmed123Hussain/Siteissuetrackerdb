import { useState, useCallback, useEffect } from 'react';
import { Issue } from '../types/index';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'elv_issues';

export const useIssueStorage = () => {
  const [issues, setIssues] = useState<Issue[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    // If Supabase is configured, load from Supabase and subscribe to realtime changes
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
        setIssues(data as Issue[]);
      }
    })();

    const channel = supabase
      .channel('public:issues')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'issues' }, (payload) => {
        const newRow = payload.new as Issue;
        setIssues(prev => [newRow, ...prev.filter(i => i.id !== newRow.id)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'issues' }, (payload) => {
        const updated = payload.new as Issue;
        setIssues(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'issues' }, (payload) => {
        const deleted = payload.old as Issue;
        setIssues(prev => prev.filter(i => i.id !== deleted.id));
      })
      .subscribe();

    return () => {
      mounted = false;
      // unsubscribe
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
    } as unknown as Issue;

    const { data, error } = await supabase.from('issues').insert(toInsert).select().single();
    if (error) {
      console.error('Supabase insert error:', error);
      // fallback to local
      setIssues(prev => [toInsert, ...prev]);
      return toInsert;
    }

    return data as Issue;
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

    setIssues(prev => prev.map(issue => issue.id === issueId ? (data as Issue) : issue));
  }, []);

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

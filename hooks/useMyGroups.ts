import { useCallback, useEffect, useState } from 'react';
import type { Group } from '@/types/database.example';
import { groupService } from '@/services';

interface UseMyGroupsResult {
  groups: Group[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMyGroups(): UseMyGroupsResult {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupService.getMyGroups();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load groups'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { groups, loading, error, refetch: load };
}

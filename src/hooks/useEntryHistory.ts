import { useQuery } from '@tanstack/react-query';
import { getEntryAudit, getEntryVersions } from '@/api/entries';
import { QK } from '@/utils/queryKeys';

export function useEntryHistory(entryId: string) {
  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: QK.history(entryId),
    queryFn: () => getEntryVersions(entryId),
  });

  const { data: audit = [], isLoading: auditLoading } = useQuery({
    queryKey: QK.audit(entryId),
    queryFn: () => getEntryAudit(entryId),
  });

  return {
    versions,
    audit,
    isLoading: versionsLoading || auditLoading,
  };
}

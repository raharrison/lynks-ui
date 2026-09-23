import {App} from 'antd';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {revertEntry} from '@/api/entries';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';
import type {AnyEntry, EntryType} from '@/types';

export function useRevertEntry() {
    const {message} = App.useApp();
    const queryClient = useQueryClient();

    const {mutate: revert, isPending: isReverting} = useMutation({
        mutationFn: ({type, id, version}: { type: EntryType; id: string; version: number }) =>
            revertEntry(type, id, version),
        onSuccess: (entry: AnyEntry, {version}) => {
            queryClient.setQueryData(QK.entry(entry.id), entry);
            queryClient.invalidateQueries({queryKey: QK.history(entry.id)});
            queryClient.invalidateQueries({queryKey: QK.audit(entry.id)});
            queryClient.invalidateQueries({queryKey: QK.entries()});
            message.success(`Restored version ${version} as v${entry.version}`);
        },
        onError: (err) => message.error(getApiErrorMessage(err, 'Failed to restore version')),
    });

    return {revert, isReverting};
}

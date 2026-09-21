import {useQuery} from '@tanstack/react-query';
import {getDigest} from '@/api/digest';
import {QK} from '@/utils/queryKeys';

export function useDigest() {
    const {data, isLoading, isError} = useQuery({
        queryKey: QK.digest(),
        queryFn: getDigest,
    });

    return {digest: data ?? null, isLoading, isError};
}

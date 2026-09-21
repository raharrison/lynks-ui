import client from './client';
import type {Digest} from '@/types';

export async function getDigest(): Promise<Digest | null> {
    try {
        const {data} = await client.get('/digest');
        return data;
    } catch (e) {
        // no digest has been generated yet
        if (isNotFound(e)) return null;
        throw e;
    }
}

function isNotFound(e: unknown): boolean {
    return typeof e === 'object' && e !== null && 'response' in e
        && (e as { response?: { status?: number } }).response?.status === 404;
}

import client from './client';
import type {Health} from '@/types';

export async function getHealth(): Promise<Health> {
    const {data} = await client.get<Health>('/health');
    return data;
}

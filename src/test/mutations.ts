import {expect} from 'vitest';
import {waitFor} from '@testing-library/react';
import type {QueryClient} from '@tanstack/react-query';

/**
 * Waits for every mutation to settle. A `useMutation` callback that returns antd's message
 * thenable holds its mutation pending until the toast closes, so this also catches that.
 */
export async function mutationsSettled(queryClient: QueryClient) {
    await waitFor(() => expect(queryClient.isMutating()).toBe(0));
}

import {describe, expect, it} from 'vitest';
import {act, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {user} from '@/test/fixtures';
import {useAuthStore} from '@/stores/authStore';
import {QK} from '@/utils/queryKeys';
import {useLogout} from './useAuth';

describe('useLogout', () => {
    it('clears the user and the query cache', async () => {
        server.use(http.post('/api/logout', () => new HttpResponse(null, {status: 204})));
        useAuthStore.setState({user: user()});
        const {result, queryClient} = renderHookWithProviders(() => useLogout());
        queryClient.setQueryData(QK.entry('secret'), {id: 'secret'});

        act(() => result.current.logout());

        await waitFor(() => expect(useAuthStore.getState().user).toBeNull());
        expect(queryClient.getQueryData(QK.entry('secret'))).toBeUndefined();
    });

    it('still clears the user when the server call fails', async () => {
        server.use(http.post('/api/logout', () => new HttpResponse(null, {status: 500})));
        useAuthStore.setState({user: user()});
        const {result} = renderHookWithProviders(() => useLogout());

        act(() => result.current.logout());

        await waitFor(() => expect(useAuthStore.getState().user).toBeNull());
    });
});

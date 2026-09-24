import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {link} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import LinkDetail from './LinkDetail';

describe('LinkDetail', () => {
    it('toggles read state and refreshes the entry', async () => {
        const calls: string[] = [];
        server.use(http.post('/api/link/l1/:action', ({params}) => {
            calls.push(params.action as string);
            return HttpResponse.json(link());
        }));
        const {queryClient} = renderWithProviders(<LinkDetail entry={link({id: 'l1', read: false})}/>);
        queryClient.setQueryData(QK.entry('l1'), link({id: 'l1'}));

        await userEvent.click(screen.getByRole('button', {name: /Unread/}));

        await waitFor(() => expect(calls).toEqual(['read']));
        expect(queryClient.getQueryState(QK.entry('l1'))!.isInvalidated).toBe(true);
    });

    it('marks a read link unread', async () => {
        const calls: string[] = [];
        server.use(http.post('/api/link/l1/:action', ({params}) => {
            calls.push(params.action as string);
            return HttpResponse.json(link());
        }));
        renderWithProviders(<LinkDetail entry={link({id: 'l1', read: true})}/>);

        await userEvent.click(screen.getByRole('button', {name: /Read/}));

        await waitFor(() => expect(calls).toEqual(['unread']));
    });

    it('flags dead links and shows the thumbnail', () => {
        renderWithProviders(<LinkDetail
            entry={link({id: 'l1', thumbnailId: 't1', props: {attributes: {dead: true}, tasks: []}})}/>);
        expect(screen.getByText('Dead Link')).toBeInTheDocument();
        expect(screen.getByRole('img', {name: 'Thumbnail'})).toHaveAttribute('src', '/api/entry/l1/resource/t1');
    });

    it('does not flag a link whose dead attribute is a failure timestamp', () => {
        renderWithProviders(<LinkDetail entry={link({props: {attributes: {dead: 1700000000000}, tasks: []}})}/>);
        expect(screen.queryByText('Dead Link')).not.toBeInTheDocument();
    });

    it('embeds youtube videos through the privacy domain', async () => {
        renderWithProviders(<LinkDetail entry={link({url: 'https://youtu.be/dQw4w9WgXcQ'})}/>);

        await userEvent.click(screen.getByText('Video'));

        expect(await screen.findByTitle('YouTube video player'))
            .toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });
});

import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {activity, page} from '@/test/fixtures';
import ActivityLog from './ActivityLog';

describe('ActivityLog', () => {
    it('lists activity and opens the entry', async () => {
        server.use(http.get('/api/user/activity', () => HttpResponse.json(page([
            activity({entryId: 'e5', details: 'Link processed', entryTitle: 'Some page', src: 'scraper'}),
        ]))));
        const {location} = renderWithProviders(<ActivityLog/>);

        await userEvent.click(await screen.findByText('Link processed'));

        expect(screen.getByText('Some page')).toBeInTheDocument();
        expect(screen.getByText('scraper')).toBeInTheDocument();
        expect(location().pathname).toBe('/entry/e5');
    });

    it('pages through activity', async () => {
        const pages: string[] = [];
        server.use(http.get('/api/user/activity', ({request}) => {
            pages.push(new URL(request.url).searchParams.get('page')!);
            return HttpResponse.json(page([activity()], {total: 45}));
        }));
        renderWithProviders(<ActivityLog/>);

        await userEvent.click(await screen.findByTitle('3'));

        await waitFor(() => expect(pages).toEqual(['1', '3']));
    });

    it('shows empty and error states', async () => {
        server.use(http.get('/api/user/activity', () => HttpResponse.json(page([]))));
        const {unmount} = renderWithProviders(<ActivityLog/>);
        expect(await screen.findByText('No activity yet')).toBeInTheDocument();
        unmount();

        server.use(http.get('/api/user/activity', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<ActivityLog/>);
        expect(await screen.findByText('Failed to load activity log')).toBeInTheDocument();
    });
});

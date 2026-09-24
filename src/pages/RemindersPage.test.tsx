import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {page, recurringReminder} from '@/test/fixtures';
import RemindersPage from './RemindersPage';

describe('RemindersPage', () => {
    it('lists every reminder with a link to its entry', async () => {
        server.use(http.get('/api/reminder', () => HttpResponse.json(page([
            recurringReminder({message: 'Weekly', entryId: 'n1', entryType: 'note', entryTitle: 'Plans'}),
        ]))));
        renderWithProviders(<RemindersPage/>);

        expect(await screen.findByText('Weekly')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /Plans/})).toHaveAttribute('href', '/notes/n1');
    });

    it('pages through reminders', async () => {
        const pages: string[] = [];
        server.use(http.get('/api/reminder', ({request}) => {
            pages.push(new URL(request.url).searchParams.get('page')!);
            return HttpResponse.json(page([recurringReminder()], {total: 41}));
        }));
        renderWithProviders(<RemindersPage/>);

        expect(await screen.findByText('41 reminders')).toBeInTheDocument();
        await userEvent.click(screen.getByTitle('3'));

        await waitFor(() => expect(pages).toEqual(['1', '3']));
    });

    it('shows empty and error states', async () => {
        server.use(http.get('/api/reminder', () => HttpResponse.json(page([]))));
        const {unmount} = renderWithProviders(<RemindersPage/>);
        expect(await screen.findByText(/No reminders yet/)).toBeInTheDocument();
        unmount();

        server.use(http.get('/api/reminder', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<RemindersPage/>);
        expect(await screen.findByText('Failed to load reminders')).toBeInTheDocument();
    });
});

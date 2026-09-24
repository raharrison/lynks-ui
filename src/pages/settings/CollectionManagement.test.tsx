import {describe, expect, it} from 'vitest';
import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {collection} from '@/test/fixtures';
import CollectionManagement from './CollectionManagement';

describe('CollectionManagement', () => {
    it('edits a nested collection knowing its parent', async () => {
        let body: unknown;
        server.use(
            http.get('/api/collection', () => HttpResponse.json([
                collection({id: 'root', name: 'Root', children: [collection({id: 'kid', name: 'Kid'})]}),
            ])),
            http.put('/api/collection', async ({request}) => {
                body = await request.json();
                return HttpResponse.json({});
            }),
        );
        renderWithProviders(<CollectionManagement/>);

        const row = (await screen.findByText('Kid')).closest('div[style]') as HTMLElement;
        await userEvent.click(within(row).getByRole('button', {name: 'edit'}));
        await userEvent.click(await screen.findByRole('button', {name: 'OK'}));

        await waitFor(() => expect(body).toEqual({id: 'kid', name: 'Kid', parentId: 'root'}));
    });

    it('deletes a collection', async () => {
        let deleted = '';
        server.use(
            http.get('/api/collection', () => HttpResponse.json([collection({id: 'c1', name: 'Reading'})])),
            http.delete('/api/collection/:id', ({params}) => {
                deleted = params.id as string;
                return new HttpResponse(null, {status: 204});
            }),
        );
        renderWithProviders(<CollectionManagement/>);

        await userEvent.click(within((await screen.findByText('Reading')).closest('div[style]') as HTMLElement).getByRole('button', {name: 'delete'}));
        await userEvent.click(await screen.findByRole('button', {name: 'Delete'}));

        expect(await screen.findByText('Collection deleted')).toBeInTheDocument();
        expect(deleted).toBe('c1');
    });
});

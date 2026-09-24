import {describe, expect, it} from 'vitest';
import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {tag} from '@/test/fixtures';
import TagManagement from './TagManagement';

describe('TagManagement', () => {
    it('lists nested tags and deletes one', async () => {
        let tags = [tag({id: 'a', name: 'Dev', children: [tag({id: 'b', name: 'Rust'})]})];
        server.use(
            http.get('/api/tag', () => HttpResponse.json(tags)),
            http.delete('/api/tag/b', () => {
                tags = [tag({id: 'a', name: 'Dev'})];
                return new HttpResponse(null, {status: 204});
            }),
        );
        renderWithProviders(<TagManagement/>);

        const row = (await screen.findByText('Rust')).closest('div[style]') as HTMLElement;
        expect(row).toHaveStyle({paddingLeft: '36px'});
        await userEvent.click(within(row).getByRole('button', {name: 'delete'}));
        await userEvent.click(await screen.findByRole('button', {name: 'Delete'}));

        expect(await screen.findByText('Tag deleted')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Rust')).not.toBeInTheDocument());
    });

    it('opens the editor for a tag', async () => {
        server.use(http.get('/api/tag', () => HttpResponse.json([tag({id: 'a', name: 'Dev'})])));
        renderWithProviders(<TagManagement/>);

        await userEvent.click(within((await screen.findByText('Dev')).closest('div[style]') as HTMLElement).getByRole('button', {name: 'edit'}));

        expect(await screen.findByText('Edit Tag')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Name')).toHaveValue('Dev');
    });

    it('says when there are no tags', async () => {
        server.use(http.get('/api/tag', () => HttpResponse.json([])));
        renderWithProviders(<TagManagement/>);
        expect(await screen.findByText(/No tags yet/)).toBeInTheDocument();
    });
});

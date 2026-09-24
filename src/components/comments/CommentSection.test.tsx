import {describe, expect, it, vi} from 'vitest';
import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {comment, page} from '@/test/fixtures';
import type {Comment} from '@/types';
import CommentSection from './CommentSection';

vi.mock('@/components/common/editor/RichEditor', () => import('@/test/FakeEditor'));

let pageSizes: (string | null)[] = [];

function serve(initial: Comment[]) {
    let comments = initial;
    const writes: { method: string; path: string; body?: unknown }[] = [];
    pageSizes = [];
    server.use(
        http.get('/api/entry/l1/comments', ({request}) => {
            pageSizes.push(new URL(request.url).searchParams.get('size'));
            return HttpResponse.json(page(comments));
        }),
        http.post('/api/entry/l1/comments', async ({request}) => {
            const body = await request.json() as { plainContent: string };
            writes.push({method: 'POST', path: '', body});
            comments = [...comments, comment({
                id: 'new',
                plainContent: body.plainContent,
                renderedContent: `<p>${body.plainContent}</p>`
            })];
            return HttpResponse.json(comments.at(-1));
        }),
        http.put('/api/entry/l1/comments', async ({request}) => {
            writes.push({method: 'PUT', path: '', body: await request.json()});
            return HttpResponse.json({});
        }),
        http.delete('/api/entry/l1/comments/:id', ({params}) => {
            writes.push({method: 'DELETE', path: params.id as string});
            comments = comments.filter((c) => c.id !== params.id);
            return new HttpResponse(null, {status: 204});
        }),
    );
    return writes;
}

describe('CommentSection', () => {
    it('shows an empty state and disables posting a blank comment', async () => {
        serve([]);
        renderWithProviders(<CommentSection entryId="l1"/>);

        expect(await screen.findByText('No comments yet')).toBeInTheDocument();
        expect(pageSizes).toEqual(['100']);
        await userEvent.type(screen.getByLabelText('Editor'), '   ');
        expect(screen.getByRole('button', {name: /Comment/})).toBeDisabled();
    });

    it('adds a comment, clears the editor and shows it', async () => {
        const writes = serve([]);
        renderWithProviders(<CommentSection entryId="l1"/>);

        await userEvent.type(screen.getByLabelText('Editor'), 'First!');
        await userEvent.click(screen.getByRole('button', {name: /Comment/}));

        expect(await screen.findByText('Comment added')).toBeInTheDocument();
        expect(await screen.findByText('First!')).toBeInTheDocument();
        expect(screen.getByLabelText('Editor')).toHaveValue('');
        expect(writes).toEqual([{method: 'POST', path: '', body: {plainContent: 'First!'}}]);
        expect(screen.getByText('Comments (1)')).toBeInTheDocument();
    });

    it('sanitises rendered comments', async () => {
        serve([comment({renderedContent: '<p>ok</p><img src="x" onerror="alert(1)"><script>alert(2)</script>'})]);
        const {container} = renderWithProviders(<CommentSection entryId="l1"/>);

        expect(await screen.findByText('ok')).toBeInTheDocument();
        expect(container.querySelector('script')).toBeNull();
        expect(container.querySelector('[onerror]')).toBeNull();
    });

    it('falls back to plain text and marks edited comments', async () => {
        serve([comment({renderedContent: '', plainContent: '<b>raw</b>', dateUpdated: '2026-01-16T00:00:00Z'})]);
        renderWithProviders(<CommentSection entryId="l1"/>);

        expect(await screen.findByText('<b>raw</b>')).toBeInTheDocument();
        expect(screen.getByText(/\(edited\)/)).toBeInTheDocument();
    });

    it('edits a comment from its markdown', async () => {
        const writes = serve([comment({id: 'c1', plainContent: 'before'})]);
        renderWithProviders(<CommentSection entryId="l1"/>);
        const item = (await screen.findByText('Nice')).closest('.comment-item') as HTMLElement;

        await userEvent.click(within(item).getByRole('button', {name: 'edit'}));
        const editors = screen.getAllByLabelText('Editor');
        expect(editors[1]).toHaveValue('before');
        await userEvent.type(editors[1], ' after');
        await userEvent.click(within(item).getByRole('button', {name: 'Save'}));

        await waitFor(() => expect(writes).toEqual([{method: 'PUT', path: '', body: {id: 'c1', plainContent: 'before after'}}]));
        await waitFor(() => expect(screen.getAllByLabelText('Editor')).toHaveLength(1));
    });

    it('deletes a comment after confirmation', async () => {
        const writes = serve([comment({id: 'c1'})]);
        renderWithProviders(<CommentSection entryId="l1"/>);
        const item = (await screen.findByText('Nice')).closest('.comment-item') as HTMLElement;

        await userEvent.click(within(item).getByRole('button', {name: 'delete'}));
        await userEvent.click(await screen.findByRole('button', {name: 'Delete'}));

        expect(await screen.findByText('Comment deleted')).toBeInTheDocument();
        expect(writes).toEqual([{method: 'DELETE', path: 'c1'}]);
        expect(await screen.findByText('No comments yet')).toBeInTheDocument();
    });

    it('reports a failed post and keeps the draft', async () => {
        serve([]);
        server.use(http.post('/api/entry/l1/comments', () => HttpResponse.json({message: 'Too long'}, {status: 400})));
        renderWithProviders(<CommentSection entryId="l1"/>);

        await userEvent.type(screen.getByLabelText('Editor'), 'draft');
        await userEvent.click(screen.getByRole('button', {name: /Comment/}));

        expect(await screen.findByText('Too long')).toBeInTheDocument();
        expect(screen.getByLabelText('Editor')).toHaveValue('draft');
    });
});

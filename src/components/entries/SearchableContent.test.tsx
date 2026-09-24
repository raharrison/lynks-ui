import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {link} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import SearchableContent from './SearchableContent';

describe('SearchableContent', () => {
    it('sanitises scraped content but keeps its formatting and highlighting', async () => {
        const {container} = renderWithProviders(<SearchableContent entryId="l1" content={[
            '# Title',
            '',
            '<p onclick="alert(1)">para <a href="javascript:alert(2)">bad link</a></p>',
            '<img src="x" onerror="alert(3)"><script>alert(4)</script>',
            '<iframe src="https://evil.test"></iframe><style>body{display:none}</style><form action="https://evil.test"><input></form>',
            '',
            '```js',
            'const x = 1;',
            '```',
        ].join('\n')}/>);

        await userEvent.click(screen.getByText('Searchable Content'));

        expect(screen.getByRole('heading', {name: 'Title'})).toBeInTheDocument();
        const body = container.querySelector('.markdown-content')!;
        expect(body.querySelector('script, iframe, style, form')).toBeNull();
        expect(body.querySelector('[onclick], [onerror]')).toBeNull();
        expect(screen.getByText('bad link').getAttribute('href') ?? '').not.toMatch(/javascript/i);
        expect(body.querySelector('pre code.hljs')).not.toBeNull();
    });

    it('opens the panel when editing starts from the collapsed header', async () => {
        renderWithProviders(<SearchableContent entryId="l1" content="words"/>);
        expect(screen.queryByText('words')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: 'edit Edit'}));

        expect(await screen.findByRole('textbox')).toHaveValue('words');
    });

    it('prompts to add content when there is none', async () => {
        renderWithProviders(<SearchableContent entryId="l1" content={null}/>);
        await userEvent.click(screen.getByText('Searchable Content'));
        expect(screen.getByText('No content. Click Edit to add some.')).toBeInTheDocument();
    });

    it('edits the content as plain text and refreshes the entry', async () => {
        let body = '';
        server.use(http.post('/api/link/l1/content', async ({request}) => {
            body = await request.text();
            return HttpResponse.json({content: body});
        }));
        const {queryClient} = renderWithProviders(<SearchableContent entryId="l1" content="old words"/>);
        queryClient.setQueryData(QK.entry('l1'), link({id: 'l1'}));

        await userEvent.click(screen.getByRole('button', {name: 'edit Edit'}));
        const box = await screen.findByRole('textbox');
        expect(box).toHaveValue('old words');
        await userEvent.clear(box);
        await userEvent.type(box, 'new words');
        await userEvent.click(screen.getByRole('button', {name: /Save/}));

        expect(await screen.findByText('Content updated')).toBeInTheDocument();
        expect(body).toBe('new words');
        expect(queryClient.getQueryState(QK.entry('l1'))!.isInvalidated).toBe(true);
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('discards an edit on cancel', async () => {
        renderWithProviders(<SearchableContent entryId="l1" content="kept"/>);

        await userEvent.click(screen.getByRole('button', {name: 'edit Edit'}));
        await userEvent.type(await screen.findByRole('textbox'), ' changed');
        await userEvent.click(screen.getByRole('button', {name: /Cancel/}));

        expect(screen.getByText('kept')).toBeInTheDocument();
    });
});

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {waitFor} from '@testing-library/react';
import {defaultValueCtx, Editor, rootCtx} from '@milkdown/kit/core';
import {commonmark} from '@milkdown/kit/preset/commonmark';
import {getMarkdown} from '@milkdown/kit/utils';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {slimNote} from '@/test/fixtures';
import {mentionPlugins} from './mention';

let editor: Editor | undefined;
let root: HTMLElement;
// Labels and the fetch queue are module state, so earlier tests' mentions can share a batch
let batches: string[][] = [];

beforeEach(() => {
    batches = [];
    server.use(http.get('/api/entry/resolve', ({request}) => {
        const ids = new URL(request.url).searchParams.get('ids')!.split(',');
        batches.push(ids);
        return HttpResponse.json(ids.filter((id) => id !== 'missing').map((id) => slimNote({id, title: `Title ${id}`})));
    }));
    root = document.createElement('div');
    document.body.appendChild(root);
});

afterEach(async () => {
    await editor?.destroy();
    editor = undefined;
    root.remove();
});

async function load(markdown: string) {
    editor = await Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, markdown);
        })
        .use(commonmark)
        .use(mentionPlugins)
        .create();
    return editor;
}

const mentions = () => [...root.querySelectorAll<HTMLElement>('[data-mention]')];

describe('entry mentions', () => {
    it('parses a bare @id into a mention and writes it back unchanged', async () => {
        const e = await load('See @abc123 and @def-456 for details.');

        expect(mentions().map((m) => m.dataset.mention)).toEqual(['abc123', 'def-456']);
        expect(e.action(getMarkdown()).trim()).toBe('See @abc123 and @def-456 for details.');
    });

    it('leaves email addresses, code and links alone', async () => {
        const md = 'Mail me@example.com, run `@notamention`, or [@alsonot](https://x.dev).';
        const e = await load(md);

        expect(mentions()).toHaveLength(0);
        expect(e.action(getMarkdown()).trim()).toBe(md);
    });

    it('ignores ids longer than the server allows', async () => {
        await load('@abcdefghijklmnopq');
        expect(mentions()).toHaveLength(0);
    });

    it('finds mentions inside emphasis and lists', async () => {
        await load('- *ping @inlist*\n- @second');
        expect(mentions().map((m) => m.dataset.mention)).toEqual(['inlist', 'second']);
    });

    it('shows resolved titles, fetched in one batch, and keeps the id when unresolved', async () => {
        await load('@aaa @bbb @missing');

        await waitFor(() => expect(mentions().map((m) => m.textContent)).toEqual(['@Title aaa', '@Title bbb', '@missing']));
        const ours = batches.filter((ids) => ids.some((id) => ['aaa', 'bbb', 'missing'].includes(id)));
        expect(ours).toHaveLength(1);
        expect(ours[0]).toEqual(expect.arrayContaining(['aaa', 'bbb', 'missing']));
    });
});

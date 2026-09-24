import {createRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {page, slimLink, slimNote} from '@/test/fixtures';
import MilkdownEditor from './MilkdownEditor';
import MentionList, {type MentionListHandle} from './MentionList';

async function mount(value: string) {
    const onChange = vi.fn();
    const utils = renderWithProviders(<MilkdownEditor value={value} onChange={onChange}/>);
    await waitFor(() => expect(utils.container.querySelector('.ProseMirror')).not.toBeNull(), {timeout: 5000});
    const editor = utils.container.querySelector<HTMLElement>('.ProseMirror')!;
    return {...utils, onChange, editor};
}

const settle = () => new Promise((r) => setTimeout(r, 100));

// Without layout a click cannot place the caret. ProseMirror restores its own selection shortly after
// focus, so focus first, then move the DOM selection and let it read the change.
async function typeAtEnd(paragraph: HTMLElement, text: string) {
    paragraph.closest<HTMLElement>('.ProseMirror')!.focus();
    await settle();
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    range.collapse(false);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    await userEvent.type(paragraph, text, {skipClick: true});
}

describe('MilkdownEditor', () => {
    it('does not report opening an entry as an edit, even when remark would rephrase it', async () => {
        const {onChange, editor} = await mount('* one\n* two\n\nSome *text*');
        await settle();

        expect(editor).toHaveTextContent('one');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('emits markdown with the pinned bullet style on edit', async () => {
        const {onChange, editor} = await mount('* one\n* two\n\nOutro');

        await typeAtEnd(editor.querySelector<HTMLElement>(':scope > p')!, ' more');

        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('- one\n- two\n\nOutro more\n'));
    });

    it('takes a new value from the parent without echoing it back', async () => {
        const onChange = vi.fn();
        const {container, rerender} = renderWithProviders(<MilkdownEditor value="first" onChange={onChange}/>);
        await waitFor(() => expect(container.querySelector('.ProseMirror')).toHaveTextContent('first'), {timeout: 5000});

        rerender(<MilkdownEditor value="replaced from outside" onChange={onChange}/>);

        await waitFor(() => expect(container.querySelector('.ProseMirror')).toHaveTextContent('replaced from outside'));
        await settle();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('suggests entries after @ and inserts the chosen one as a bare id', async () => {
        const target = slimNote({id: 'abc123', title: 'Meeting notes'});
        let query: string | null = null;
        server.use(
            http.get('/api/entry/suggest', ({request}) => {
                query = new URL(request.url).searchParams.get('q');
                return HttpResponse.json(page([target]));
            }),
            http.get('/api/entry/resolve', () => HttpResponse.json([target])),
        );
        const {onChange, editor} = await mount('See');

        await typeAtEnd(editor.querySelector('p')!, ' @mee');
        await userEvent.click(await screen.findByText('Meeting notes'));

        expect(query).toBe('mee');
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^See @abc123\s*\n$/)));
    });
});

describe('MentionList', () => {
    const items = [slimNote({id: 'n1', title: 'Note one'}), slimLink({id: 'l1', title: 'Link one'})];

    it('renders nothing without items', () => {
        const {container} = renderWithProviders(<MentionList items={[]} command={vi.fn()}/>);
        expect(container.querySelector('.mention-dropdown')).toBeNull();
    });

    it('picks an item by click', async () => {
        const command = vi.fn();
        renderWithProviders(<MentionList items={items} command={command}/>);

        await userEvent.click(screen.getByText('Link one'));

        expect(command).toHaveBeenCalledWith({id: 'l1', label: 'Link one', entryType: 'link'});
    });

    it('moves the selection with the arrow keys, wrapping, and picks with enter', async () => {
        const command = vi.fn();
        const ref = createRef<MentionListHandle>();
        renderWithProviders(<MentionList ref={ref} items={items} command={command}/>);
        const key = (k: string) => ref.current!.onKeyDown(new KeyboardEvent('keydown', {key: k}));

        expect(key('ArrowUp')).toBe(true);
        await waitFor(() => expect(screen.getByText('Link one').closest('button')).toHaveClass('mention-item--selected'));
        expect(key('ArrowDown')).toBe(true);
        await waitFor(() => expect(screen.getByText('Note one').closest('button')).toHaveClass('mention-item--selected'));
        expect(key('Enter')).toBe(true);
        expect(command).toHaveBeenCalledWith({id: 'n1', label: 'Note one', entryType: 'note'});
        expect(key('a')).toBe(false);
    });

    it('lets the editor keep keys when there is nothing to pick', () => {
        const ref = createRef<MentionListHandle>();
        renderWithProviders(<MentionList ref={ref} items={[]} command={vi.fn()}/>);
        expect(ref.current!.onKeyDown(new KeyboardEvent('keydown', {key: 'Enter'}))).toBe(false);
    });
});

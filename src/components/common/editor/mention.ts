import {$node, $remark, $view} from '@milkdown/kit/utils';
import type {RemarkPluginRaw} from '@milkdown/kit/transformer';
import type {EditorView, NodeViewConstructor} from '@milkdown/kit/prose/view';
import {queryClient} from '@/lib/queryClient';
import {resolveEntries} from '@/api/entries';

/* Round-trips as a bare `@id` for the backend's EntryLinkInlineParserExtension. */
const MENTION_PATTERN = /(?<!\w)@([a-z\d_-]{1,16})(?![\w-])/gi;

/** Matches a mention being typed, so the suggestion list knows the query. */
const TYPING_PATTERN = /(?:^|\s)@([a-z\d_-]*)$/i;

interface MdastMention {
    type: 'mention';
    value: string;
}

type MdastNode = { type: string; value?: string; children?: MdastNode[] };

/* A mention inside a link has no markdown representation. */
const OPAQUE = new Set(['code', 'inlineCode', 'html', 'link', 'linkReference', 'definition']);

function splitText(value: string): MdastNode[] | null {
    MENTION_PATTERN.lastIndex = 0;
    const parts: MdastNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = MENTION_PATTERN.exec(value)) !== null) {
        if (match.index > last) parts.push({type: 'text', value: value.slice(last, match.index)});
        parts.push({type: 'mention', value: match[1]});
        last = match.index + match[0].length;
    }
    if (!parts.length) return null;
    if (last < value.length) parts.push({type: 'text', value: value.slice(last)});
    return parts;
}

function splitMentions(node: MdastNode): void {
    if (!node.children?.length) return;
    const next: MdastNode[] = [];
    let changed = false;
    for (const child of node.children) {
        if (child.type === 'text' && typeof child.value === 'string') {
            const parts = splitText(child.value);
            if (parts) {
                next.push(...parts);
                changed = true;
                continue;
            }
        } else if (!OPAQUE.has(child.type)) {
            splitMentions(child);
        }
        next.push(child);
    }
    if (changed) node.children = next;
}

/* Only `this.data()` is used, so narrow rather than pull in unified's generics. */
type RemarkProcessor = { data: () => Record<string, unknown> };

function remarkMentionPlugin(this: RemarkProcessor) {
    /* remark-stringify throws without an explicit handler for a node it never parsed. */
    const data = this.data();
    const extensions = (data['toMarkdownExtensions'] ??= []) as Record<string, unknown>[];
    extensions.push({handlers: {mention: (node: MdastMention) => `@${node.value}`}});

    return (tree: MdastNode) => {
        splitMentions(tree);
    };
}

export const remarkMention = $remark(
    'lynksMention',
    () => remarkMentionPlugin as unknown as RemarkPluginRaw<undefined>
);

/* Batched per tick, so a note full of mentions makes one request. */
const labels = new Map<string, string>();
const queued = new Set<string>();
const subscribers = new Set<() => void>();
let flushTimer: ReturnType<typeof setTimeout> | undefined;

async function flushLabels(): Promise<void> {
    const ids = [...queued];
    queued.clear();
    if (!ids.length) return;
    try {
        const entries = await queryClient.fetchQuery({
            queryKey: ['entries', 'resolve', ...[...ids].sort()],
            queryFn: () => resolveEntries(ids),
            staleTime: 60_000,
        });
        for (const entry of entries) {
            labels.set(entry.id, 'title' in entry ? entry.title : entry.id);
        }
    } catch {
        // Leave the raw id on screen rather than blanking the mention.
    }
    subscribers.forEach((notify) => notify());
}

function requestLabel(id: string): void {
    if (!id || labels.has(id) || queued.has(id)) return;
    queued.add(id);
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => void flushLabels(), 30);
}

export const mentionNode = $node('mention', () => ({
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    attrs: {id: {default: ''}},
    parseDOM: [
        {
            tag: 'span[data-mention]',
            getAttrs: (dom) => ({id: (dom as HTMLElement).getAttribute('data-mention') ?? ''}),
        },
    ],
    toDOM: (node) => ['span', {'data-mention': node.attrs['id'], class: 'mention-node'}, `@${node.attrs['id']}`],
    parseMarkdown: {
        match: (node) => node.type === 'mention',
        runner: (state, node, type) => {
            state.addNode(type, {id: String(node['value'] ?? '')});
        },
    },
    toMarkdown: {
        match: (node) => node.type.name === 'mention',
        runner: (state, node) => {
            state.addNode('mention', undefined, String(node.attrs['id'] ?? ''));
        },
    },
}));

export const mentionView = $view(mentionNode, () => ((node) => {
    const dom = document.createElement('span');
    dom.className = 'mention-node';
    dom.setAttribute('data-mention', node.attrs['id']);
    const render = () => {
        dom.textContent = `@${labels.get(node.attrs['id']) ?? node.attrs['id']}`;
    };
    render();
    requestLabel(node.attrs['id']);
    subscribers.add(render);
    return {dom, destroy: () => subscribers.delete(render)};
}) as NodeViewConstructor);

/** The query being typed after `@`, or null when the caret is not in a mention. */
export function readMentionQuery(view: EditorView): string | null {
    const {selection} = view.state;
    if (!selection.empty) return null;
    const {$from} = selection;
    if (!$from.parent.isTextblock) return null;
    const before = $from.parent.textBetween(0, $from.parentOffset, undefined, '￼');
    return TYPING_PATTERN.exec(before)?.[1] ?? null;
}

/** Swaps the `@query` the caret sits in for a mention node. */
export function insertMention(view: EditorView, id: string): void {
    const {state} = view;
    const {$from} = state.selection;
    const before = $from.parent.textBetween(0, $from.parentOffset, undefined, '￼');
    const match = TYPING_PATTERN.exec(before);
    if (!match) return;
    const type = state.schema.nodes['mention'];
    if (!type) return;
    // match[0] may include the space that preceded the `@`, which must be kept.
    const typed = match[0].slice(match[0].indexOf('@'));
    const tr = state.tr.replaceWith($from.pos - typed.length, $from.pos, type.create({id}));
    view.dispatch(tr.insertText(' '));
    view.focus();
}

export const mentionPlugins = [remarkMention, mentionNode, mentionView].flat();

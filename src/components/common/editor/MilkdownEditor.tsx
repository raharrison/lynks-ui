import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Crepe} from "@milkdown/crepe";
import {$prose, replaceAll} from "@milkdown/kit/utils";
import {Plugin, PluginKey} from "@milkdown/kit/prose/state";
import type {EditorView} from "@milkdown/kit/prose/view";
import {SlashProvider} from "@milkdown/kit/plugin/slash";
import {editorViewCtx, remarkStringifyOptionsCtx} from "@milkdown/kit/core";
import {App} from "antd";
import client from "@/api/client";
import {suggestEntries} from "@/api/entries";
import {IMAGE_UPLOAD_PATH, MENTION_RESULTS_SIZE} from "@/utils/constants";
import {insertMention, mentionPlugins, readMentionQuery} from "./mention";
import MentionList, {type MentionListHandle} from "./MentionList";
import type {AnySlimEntry} from "@/types";
import "@milkdown/crepe/theme/common/style.css";

async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const {data} = await client.post(IMAGE_UPLOAD_PATH, formData, {
        headers: {"Content-Type": "multipart/form-data"},
    });
    return (data as { data: { filePath: string } }).data.filePath;
}

/** Lets the ProseMirror plugin talk to React without re-creating the editor. */
interface MentionBridge {
    content: HTMLElement;
    setQuery: (query: string | null) => void;
    setView: (view: EditorView) => void;
    clearView: (view: EditorView) => void;
    keyDown: (event: KeyboardEvent) => boolean;
    hide: (fn: () => void) => void;
}

function mentionSlash(bridge: MentionBridge) {
    return $prose(() => {
        let provider: SlashProvider | null = null;
        return new Plugin({
            key: new PluginKey("lynks-mention-slash"),
            props: {
                handleKeyDown: (_view, event) => bridge.keyDown(event),
            },
            view: (view) => {
                bridge.setView(view);
                provider = new SlashProvider({
                    content: bridge.content,
                    trigger: "@",
                    shouldShow: (v) => readMentionQuery(v) !== null,
                });
                bridge.hide(() => provider?.hide());
                return {
                    update: (updated, prev) => {
                        provider?.update(updated, prev);
                        bridge.setQuery(readMentionQuery(updated));
                    },
                    destroy: () => {
                        provider?.destroy();
                        bridge.clearView(view);
                    },
                };
            },
        });
    });
}

export default function MilkdownEditor({
                                           value,
                                           onChange,
                                           minHeight = 200,
                                           autoFocus = false,
                                           flush = false,
                                       }: {
    value: string;
    onChange: (md: string) => void;
    minHeight?: number;
    autoFocus?: boolean;
    flush?: boolean;
}) {
    const {message} = App.useApp();
    const messageRef = useRef(message);
    useEffect(() => {
        messageRef.current = message;
    }, [message]);

    const rootRef = useRef<HTMLDivElement>(null);
    const crepeRef = useRef<Crepe | null>(null);
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    /* Last reconciled value prop, so the sync effect ignores our own output. */
    const parentValue = useRef<string>(value);
    /* What the editor serialises to untouched; remark rephrases, and that is not an edit. */
    const baseline = useRef<string | null>(null);
    const applyingExternal = useRef(false);
    const initialValue = useRef(value);

    const [items, setItems] = useState<AnySlimEntry[]>([]);
    const [query, setQuery] = useState<string | null>(null);
    const listRef = useRef<MentionListHandle>(null);
    const viewRef = useRef<EditorView | null>(null);
    const hideRef = useRef<(() => void) | null>(null);
    const queryRef = useRef<string | null>(null);

    const mentionRoot = useMemo(() => {
        const el = document.createElement("div");
        el.className = "mention-slash-root";
        return el;
    }, []);

    const close = useCallback(() => {
        hideRef.current?.();
        queryRef.current = null;
        setQuery(null);
        setItems([]);
    }, []);

    const bridge = useMemo<MentionBridge>(
        () => ({
            content: mentionRoot,
            setQuery: (q) => {
                queryRef.current = q;
                setQuery(q);
            },
            setView: (v) => {
                viewRef.current = v;
            },
            /* StrictMode mounts twice, so only the outgoing view may clear the ref. */
            clearView: (v) => {
                if (viewRef.current === v) viewRef.current = null;
            },
            hide: (fn) => {
                hideRef.current = fn;
            },
            keyDown: (event) => {
                if (queryRef.current === null) return false;
                if (event.key === "Escape") {
                    close();
                    return true;
                }
                return listRef.current?.onKeyDown(event) ?? false;
            },
        }),
        [mentionRoot, close],
    );

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const crepe = new Crepe({
            root,
            defaultValue: initialValue.current,
            features: {
                [Crepe.Feature.CodeMirror]: true,
                [Crepe.Feature.ListItem]: true,
                [Crepe.Feature.LinkTooltip]: true,
                [Crepe.Feature.Cursor]: true,
                [Crepe.Feature.ImageBlock]: true,
                [Crepe.Feature.BlockEdit]: true,
                [Crepe.Feature.Toolbar]: true,
                [Crepe.Feature.Placeholder]: true,
                [Crepe.Feature.Table]: true,
                [Crepe.Feature.Latex]: false,
                [Crepe.Feature.TopBar]: false,
                [Crepe.Feature.AI]: false,
            },
            featureConfigs: {
                [Crepe.Feature.Placeholder]: {
                    text: "Write something, or press / for blocks and @ to link an entry…",
                },
                [Crepe.Feature.ImageBlock]: {
                    onUpload: uploadImage,
                    blockOnUpload: uploadImage,
                    inlineOnUpload: uploadImage,
                },
            },
        });

        crepe.editor
            /* Pinned to what was stored, or first save rewrites every note's bullets. */
            .config((ctx) => {
                ctx.set(remarkStringifyOptionsCtx, {
                    ...ctx.get(remarkStringifyOptionsCtx),
                    bullet: "-",
                    emphasis: "_",
                    strong: "*",
                    fence: "`",
                    rule: "-",
                    tightDefinitions: true,
                });
            })
            .use(mentionPlugins)
            .use(mentionSlash(bridge));
        crepe.on((api) =>
            api.markdownUpdated((_ctx, markdown) => {
                /* Parsing defaultValue emits an update, so match on content not timing. */
                if (applyingExternal.current || baseline.current === null) return;
                if (markdown === baseline.current) return;
                baseline.current = markdown;
                parentValue.current = markdown;
                onChangeRef.current(markdown);
            }),
        );

        let cancelled = false;
        void crepe
            .create()
            .then(() => {
                if (cancelled) {
                    void crepe.destroy();
                    return;
                }
                crepeRef.current = crepe;
                baseline.current = crepe.getMarkdown();
                if (autoFocus)
                    crepe.editor.action((ctx) => ctx.get(editorViewCtx).focus());
            })
            .catch(() => {
                messageRef.current.error("Editor failed to load");
            });

        return () => {
            cancelled = true;
            crepeRef.current = null;
            void crepe.destroy();
        };
        // Mount-only: the editor is uncontrolled internally and synced by the effect below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const crepe = crepeRef.current;
        if (!crepe || value === parentValue.current) return;
        parentValue.current = value;
        applyingExternal.current = true;
        crepe.editor.action(replaceAll(value));
        applyingExternal.current = false;
        baseline.current = crepe.getMarkdown();
    }, [value]);

    useEffect(() => {
        // "" is a bare @ with nothing typed yet; there is nothing to search for.
        if (!query) return;
        let cancelled = false;
        const timer = setTimeout(() => {
            void suggestEntries(query, {page: 1, size: MENTION_RESULTS_SIZE})
                .then((res) => {
                    if (!cancelled) setItems(res.content);
                })
                .catch(() => {
                    if (!cancelled) setItems([]);
                });
        }, 120);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);

    return (
        <div
            className={flush ? "rich-editor rich-editor--flush" : "rich-editor"}
            style={{"--editor-min-height": `${minHeight}px`} as React.CSSProperties}
        >
            <div ref={rootRef}/>
            {createPortal(
                query === null ? null : (
                    <MentionList
                        ref={listRef}
                        items={items}
                        command={({id}) => {
                            const view = viewRef.current;
                            if (view) insertMention(view, id);
                            close();
                        }}
                    />
                ),
                mentionRoot,
            )}
        </div>
    );
}

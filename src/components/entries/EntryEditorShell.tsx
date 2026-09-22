import {useEffect, useRef} from 'react';
import {Button, Modal, Tag} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import type {Blocker} from 'react-router-dom';
import {ENTRY_TYPE_LABELS} from '@/utils/constants';
import {ENTRY_TYPE_ICONS} from '@/utils/icons';
import {entryTypeChipClass} from '@/utils/format';
import type {EntryType} from '@/types';

const HINTS: Record<EntryType, string> = {
    link: 'Paste a URL and Lynks will fetch the title, screenshot and readable copy.',
    note: 'Press / for headings, lists and code. Press @ to link another entry.',
    snippet: 'Keep a piece of code with the context you will want later.',
    file: 'Upload a file and give it the tags you will actually search for.',
};

interface EntryEditorShellProps {
    type: EntryType;
    heading: string;
    isDirty: boolean;
    onBack: () => void;
    blocker: Blocker;
    children: React.ReactNode;
}

export default function EntryEditorShell({
                                             type, heading, isDirty, onBack, blocker, children,
                                         }: EntryEditorShellProps) {
    const bodyRef = useRef<HTMLDivElement>(null);

    /* The four forms submit differently, so press whatever primary action they rendered. */
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return;
            event.preventDefault();
            bodyRef.current?.querySelector<HTMLButtonElement>('.entry-form-actions .ant-btn-primary')?.click();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div className="entry-editor">
            <Button type="text" size="small" icon={<ArrowLeftOutlined/>} onClick={onBack} className="entry-editor-back">
                Back
            </Button>

            <div className="entry-editor-head">
                <div className="entry-editor-title-row">
                    <Tag className={entryTypeChipClass(type)}>
                        {ENTRY_TYPE_ICONS[type]} {ENTRY_TYPE_LABELS[type]}
                    </Tag>
                    <h1 className="entry-editor-title">{heading}</h1>
                    {isDirty && <span className="entry-editor-dirty">Unsaved changes</span>}
                </div>
                <p className="entry-editor-hint">{HINTS[type]}</p>
            </div>

            <div className="entry-editor-body" ref={bodyRef}>{children}</div>

            <Modal
                open={blocker.state === 'blocked'}
                title="Discard changes?"
                onOk={() => blocker.proceed?.()}
                onCancel={() => blocker.reset?.()}
                okText="Discard"
                okButtonProps={{danger: true}}
                cancelText="Keep editing"
            >
                You have unsaved changes. If you leave, your changes will be lost.
            </Modal>
        </div>
    );
}

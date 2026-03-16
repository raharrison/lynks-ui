import {useEffect, useRef, useState} from 'react';
import {useBlocker, useNavigate} from 'react-router-dom';
import {ENTRY_PATH_PREFIX, entryDetailPath} from '@/utils/format';
import {Button, Card, Modal} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {ENTRY_TYPE_LABELS} from '@/utils/constants';
import LinkForm from '@/components/entries/forms/LinkForm';
import NoteForm from '@/components/entries/forms/NoteForm';
import SnippetForm from '@/components/entries/forms/SnippetForm';
import FileForm from '@/components/entries/forms/FileForm';
import type {EntryType} from '@/types';

export default function CreateEntryPage({ type }: { type: EntryType }) {
    useEffect(() => {
        document.title = `New ${ENTRY_TYPE_LABELS[type]} - Lynks`;
    }, [type]);
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
    const saving = useRef(false);
    const blocker = useBlocker(() => isDirty && !saving.current);
  const listPath = `/${ENTRY_PATH_PREFIX[type]}`;
    const onSuccess = (id: string) => {
        saving.current = true;
        navigate(entryDetailPath(type, id), {state: {savedEntry: true}});
    };
  const onCancel = () => navigate(listPath);

  return (
    <div>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(listPath)} style={{ marginBottom: 16 }}>
        Back
      </Button>
      <Card title={`Create ${ENTRY_TYPE_LABELS[type]}`} style={{ borderRadius: 'var(--radius-lg)' }}>
        {type === 'link' && <LinkForm onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty} />}
        {type === 'note' && <NoteForm onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty} />}
        {type === 'snippet' && <SnippetForm onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty} />}
        {type === 'file' && <FileForm onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty} />}
      </Card>

      <Modal
        open={blocker.state === 'blocked'}
        title="Discard changes?"
        onOk={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
        okText="Discard"
        okButtonProps={{ danger: true }}
        cancelText="Keep editing"
      >
        You have unsaved changes. If you leave, your changes will be lost.
      </Modal>
    </div>
  );
}

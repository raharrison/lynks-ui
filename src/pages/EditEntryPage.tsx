import {useEffect, useRef, useState} from 'react';
import {useBlocker, useNavigate, useParams} from 'react-router-dom';
import {entryDetailPath} from '@/utils/format';
import {Button, Result} from 'antd';
import PageSkeleton from '@/components/common/PageSkeleton';
import {ENTRY_TYPE_LABELS} from '@/utils/constants';
import {useEntry} from '@/hooks/useEntry';
import EntryEditorShell from '@/components/entries/EntryEditorShell';
import LinkForm from '@/components/entries/forms/LinkForm';
import NoteForm from '@/components/entries/forms/NoteForm';
import SnippetForm from '@/components/entries/forms/SnippetForm';
import FileForm from '@/components/entries/forms/FileForm';

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entry, isLoading, isError } = useEntry(id);
  const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (!entry) return;
        const title = 'title' in entry ? entry.title : ENTRY_TYPE_LABELS[entry.type];
        document.title = `Edit ${title} - Lynks`;
    }, [entry]);
    const saving = useRef(false);
    const blocker = useBlocker(() => isDirty && !saving.current);

  if (isLoading) return <PageSkeleton rows={6} showTitle={false} />;

  if (isError || !entry) {
    return <Result status="404" title="Entry not found" extra={<Button onClick={() => navigate('/')}>Back</Button>} />;
  }

  const backPath = entryDetailPath(entry.type, entry.id);
    const onSuccess = (entryId: string) => {
        saving.current = true;
        navigate(entryDetailPath(entry.type, entryId), {state: {savedEntry: true}});
    };
  const onCancel = () => navigate(backPath);

  return (
      <EntryEditorShell
          type={entry.type}
          heading={`Edit ${ENTRY_TYPE_LABELS[entry.type].toLowerCase()}`}
          isDirty={isDirty}
          onBack={() => navigate(backPath)}
          blocker={blocker}
      >
          {entry.type === 'link' &&
              <LinkForm entry={entry} onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty}/>}
          {entry.type === 'note' &&
              <NoteForm entry={entry} onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty}/>}
          {entry.type === 'snippet' &&
              <SnippetForm entry={entry} onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty}/>}
          {entry.type === 'file' &&
              <FileForm entry={entry} onSuccess={onSuccess} onCancel={onCancel} onDirtyChange={setIsDirty}/>}
      </EntryEditorShell>
  );
}

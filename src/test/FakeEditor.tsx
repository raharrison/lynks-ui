import type {RichEditorProps} from '@/components/common/editor/RichEditor';

/** Stands in for the lazy Milkdown editor, which is exercised on its own in MilkdownEditor.test.tsx. */
export default function FakeEditor({value, onChange}: RichEditorProps) {
    return <textarea aria-label="Editor" value={value} onChange={(e) => onChange(e.target.value)}/>;
}

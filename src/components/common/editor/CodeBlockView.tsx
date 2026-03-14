import type {NodeViewProps} from '@tiptap/react';
import {NodeViewContent, NodeViewWrapper} from '@tiptap/react';
import {Select} from 'antd';
import {LANGUAGE_OPTIONS} from './lowlight';

export default function CodeBlockView({node, updateAttributes}: NodeViewProps) {
    const language = (node.attrs.language as string) || null;

    return (
        <NodeViewWrapper className="code-block-node">
            <div contentEditable={false} className="code-block-lang-select">
                <Select
                    size="small"
                    placeholder="language"
                    value={language}
                    onChange={(lang) => updateAttributes({language: lang})}
                    onClear={() => updateAttributes({language: null})}
                    options={LANGUAGE_OPTIONS}
                    allowClear
                    showSearch
                    style={{width: 120}}
                />
            </div>
            <pre><code><NodeViewContent/></code></pre>
        </NodeViewWrapper>
    );
}

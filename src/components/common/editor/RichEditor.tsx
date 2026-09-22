import {lazy, Suspense} from 'react';
import {Skeleton} from 'antd';

export interface RichEditorProps {
    value: string;
    onChange: (md: string) => void;
    minHeight?: number;
    autoFocus?: boolean;
    /** Drops the editor's own frame so the surrounding panel reads as the page. */
    flush?: boolean;
}

const MilkdownEditor = lazy(() => import('./MilkdownEditor'));

export default function RichEditor(props: RichEditorProps) {
  return (
      <Suspense
          fallback={
              <div
                  className={props.flush ? 'rich-editor rich-editor--flush' : 'rich-editor'}
                  style={{padding: '14px 18px'}}
              >
                  <Skeleton active paragraph={{rows: 3}} title={false}/>
              </div>
          }
      >
          <MilkdownEditor {...props} />
      </Suspense>
  );
}

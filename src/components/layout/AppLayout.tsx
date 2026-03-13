import { useEffect, useState } from 'react';
import { Layout, Modal, Typography } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { entryCreatePath } from '@/utils/format';

const SHORTCUT_GROUPS = [
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['g', 'h'], description: 'Go to All entries' },
      { keys: ['g', 'l'], description: 'Go to Links' },
      { keys: ['g', 'n'], description: 'Go to Notes' },
      { keys: ['g', 's'], description: 'Go to Snippets' },
      { keys: ['g', 'f'], description: 'Go to Files' },
    ],
  },
  {
    label: 'Create',
    shortcuts: [
      { keys: ['c', 'l'], description: 'New Link' },
      { keys: ['c', 'n'], description: 'New Note' },
      { keys: ['c', 's'], description: 'New Snippet' },
      { keys: ['c', 'f'], description: 'New File' },
    ],
  },
  {
    label: 'General',
    shortcuts: [
      { keys: ['/'], description: 'Focus search' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
];

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal title="Keyboard Shortcuts" open={open} onCancel={onClose} footer={null} width={480}>
      {SHORTCUT_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 20 }}>
          <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {group.label}
          </Typography.Text>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.shortcuts.map((s) => (
              <div key={s.keys.join('+')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography.Text>{s.description}</Typography.Text>
                <div style={{ display: 'flex', gap: 4 }}>
                  {s.keys.map((k, i) => (
                    <span key={i}>
                      <kbd style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--bg-code)',
                        border: '1px solid var(--border-primary)',
                        fontSize: 'var(--font-size-sm)',
                        fontFamily: 'monospace',
                      }}>{k}</kbd>
                      {i < s.keys.length - 1 && <span style={{ margin: '0 2px', color: 'var(--text-muted)' }}>then</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  );
}

function useKeyboardShortcuts(onShowHelp: () => void) {
  const navigate = useNavigate();

  useEffect(() => {
    let pending: 'g' | 'c' | null = null;
    let chordTimer: ReturnType<typeof setTimeout> | null = null;

    const clearPending = () => {
      pending = null;
      if (chordTimer) clearTimeout(chordTimer);
    };

    const handle = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (pending === 'g') {
        clearPending();
        switch (e.key) {
          case 'h': navigate('/'); break;
          case 'l': navigate('/links'); break;
          case 'n': navigate('/notes'); break;
          case 's': navigate('/snippets'); break;
          case 'f': navigate('/files'); break;
        }
        return;
      }

      if (pending === 'c') {
        clearPending();
        switch (e.key) {
          case 'l': navigate(entryCreatePath('link')); break;
          case 'n': navigate(entryCreatePath('note')); break;
          case 's': navigate(entryCreatePath('snippet')); break;
          case 'f': navigate(entryCreatePath('file')); break;
        }
        return;
      }

      if (e.key === 'g' || e.key === 'c') {
        pending = e.key;
        chordTimer = setTimeout(clearPending, 1000);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        (document.getElementById('search-input') as HTMLInputElement | null)?.focus();
        return;
      }

      if (e.key === '?') {
        onShowHelp();
      }
    };

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [navigate, onShowHelp]);
}

export default function AppLayout() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useKeyboardShortcuts(() => setShortcutsOpen(true));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSidebar />
        <Layout.Content style={{
          padding: '28px 32px',
          minHeight: 'calc(100vh - 60px)',
          overflow: 'auto',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </Layout>
  );
}

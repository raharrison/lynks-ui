import {useCallback} from 'react';
import {App} from 'antd';
import {
    CodeOutlined,
    FileOutlined,
    FileTextOutlined,
    LinkOutlined,
    ReadOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {useLogout} from '@/hooks/useAuth';
import type {EntryType} from '@/types';

export const NAV_ITEMS = [
    {key: '/', label: 'Entries', shortLabel: 'All', icon: <UnorderedListOutlined/>},
    {key: '/links', label: 'Links', shortLabel: 'Links', icon: <LinkOutlined/>},
    {key: '/notes', label: 'Notes', shortLabel: 'Notes', icon: <FileTextOutlined/>},
    {key: '/snippets', label: 'Snippets', shortLabel: 'Snippets', icon: <CodeOutlined/>},
    {key: '/files', label: 'Files', shortLabel: 'Files', icon: <FileOutlined/>},
    {key: '/digest', label: 'Digest', shortLabel: 'Digest', icon: <ReadOutlined/>},
];

/** Pages outside the nav (settings, notifications) match nothing and select nothing. */
export function selectedNavKey(pathname: string): string | null {
    if (pathname === '/') return '/';
    return NAV_ITEMS.find((n) => n.key !== '/' && pathname.startsWith(n.key))?.key ?? null;
}

export const CREATE_ITEMS: { type: EntryType; label: string; description: string; icon: React.ReactNode }[] = [
    {type: 'link', label: 'Link', description: 'Save a page to read later', icon: <LinkOutlined/>},
    {type: 'note', label: 'Note', description: 'Write in markdown', icon: <FileTextOutlined/>},
    {type: 'snippet', label: 'Snippet', description: 'Keep a piece of code', icon: <CodeOutlined/>},
    {type: 'file', label: 'File', description: 'Upload a document', icon: <FileOutlined/>},
];

export function useSignOut() {
    const navigate = useNavigate();
    const {message} = App.useApp();
    const {logout} = useLogout();

    return useCallback(() => {
        logout(undefined, {
            onSuccess: () => navigate('/login', {replace: true}),
            onError: () => {
                message.error('Logout failed - you may still be signed in on the server');
                navigate('/login', {replace: true});
            },
        });
    }, [logout, navigate, message]);
}

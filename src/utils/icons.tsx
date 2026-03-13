import type { ReactNode } from 'react';
import { CodeOutlined, FileOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons';
import type { EntryType } from '@/types';

export const ENTRY_TYPE_ICONS: Record<EntryType, ReactNode> = {
  link: <LinkOutlined />,
  note: <FileTextOutlined />,
  snippet: <CodeOutlined />,
  file: <FileOutlined />,
};

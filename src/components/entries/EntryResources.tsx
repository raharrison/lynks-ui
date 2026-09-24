import {App, Button, Empty, Popconfirm, Spin, Tag, Tooltip, Typography, Upload} from 'antd';
import {
    DeleteOutlined,
    DownloadOutlined,
    FileOutlined,
    FileTextOutlined,
    GlobalOutlined,
    PictureOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import {Link} from 'react-router-dom';
import {getResourceUrl} from '@/api/resources';
import {entryDetailPath, formatDate, formatFileSize} from '@/utils/format';
import type {EntryType, Resource, ResourceType} from '@/types';
import {useResources} from '@/hooks/useResources';

const resourceTypeIcons: Partial<Record<ResourceType, React.ReactNode>> = {
  upload: <UploadOutlined />,
  screenshot: <PictureOutlined />,
  thumbnail: <PictureOutlined />,
  preview: <PictureOutlined />,
  page: <FileTextOutlined />,
  document: <FileTextOutlined />,
  readable_doc: <FileTextOutlined />,
  readable_text: <FileTextOutlined />,
  generated: <FileOutlined />,
  single_file: <GlobalOutlined/>,
};

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);

export default function EntryResources({ entryId, entryType }: { entryId: string; entryType: EntryType }) {
  const { message } = App.useApp();
  const { resources, isLoading, isError, upload, remove, isUploading } = useResources(entryId);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Text strong style={{ fontSize: 'var(--font-size-md)' }}>
          Resources ({resources.length})
        </Typography.Text>
        <Upload
          showUploadList={false}
          multiple
          beforeUpload={(file) => {
            upload(file, {
              onSuccess: () => message.success('File uploaded successfully'),
            });
            return false;
          }}
        >
          <Button icon={<UploadOutlined />} loading={isUploading} style={{ borderRadius: 'var(--radius-pill)' }}>
            Upload
          </Button>
        </Upload>
      </div>

      {isError ? (
        <Empty description="Failed to load resources" />
      ) : resources.length === 0 ? (
        <Empty description="No resources. Upload files using the button above." style={{ padding: '24px 0' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {resources.map((resource: Resource) => {
            const isImage = imageExtensions.has(resource.extension.toLowerCase());
            const url = getResourceUrl(entryId, resource.id);

            return (
              <Link
                key={resource.id}
                to={`${entryDetailPath(entryType, entryId)}/resource/${resource.id}`}
                className="resource-item"
                style={{ cursor: 'pointer', display: 'flex', textDecoration: 'none', color: 'inherit' }}
              >
                {isImage ? (
                  <img
                    src={url}
                    alt={resource.name}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-code)', fontSize: 20, color: 'var(--text-muted)',
                  }}>
                    {resourceTypeIcons[resource.type] || <FileOutlined />}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Typography.Text strong style={{ fontSize: 'var(--font-size-sm)' }} ellipsis>{resource.name}</Typography.Text>
                      <Tag className="lynks-chip" style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>{resource.type}</Tag>
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                    {formatFileSize(resource.size)} &middot; v{resource.version} &middot; {formatDate(resource.dateCreated)}
                  </Typography.Text>
                </div>

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.preventDefault()}>
                  <Tooltip title="Download">
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      aria-label={`Download ${resource.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = resource.name;
                        a.click();
                      }}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Delete this resource?"
                    onConfirm={() => remove(resource.id, {
                      onSuccess: () => message.success('Resource deleted'),
                    })}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={`Delete ${resource.name}`} />
                  </Popconfirm>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

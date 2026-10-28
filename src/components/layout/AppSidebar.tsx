import {useEffect, useMemo, useState} from 'react';
import {Button, ConfigProvider, Drawer, Layout, Menu, Spin, Tooltip, Tree, Typography} from 'antd';
import {
  CloseOutlined,
  DownOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {refreshCollections, refreshTags} from '@/api/groups';
import {useSidebarStore} from '@/stores/sidebarStore';
import {useGroupFilters} from '@/hooks/useGroupFilter';
import {useGroups} from '@/hooks/useGroups';
import {QK} from '@/utils/queryKeys';
import {useIsMobile} from '@/hooks/useIsMobile';
import {mapTree} from '@/utils/groups';
import type {Collection, Tag} from '@/types';
import type {DataNode} from 'antd/es/tree';
import GroupModal from '@/components/groups/GroupModal';
import {NAV_ITEMS, selectedNavKey} from './navigation';

const { Text } = Typography;

const treeTheme = {components: {Tree: {switcherSize: 20, indentSize: 16}}};
const treeSwitcherIcon = <DownOutlined style={{fontSize: 10, color: 'var(--text-muted)'}}/>;

const tagsToTreeData = (tags: Tag[]): DataNode[] =>
  mapTree(tags, (t, children) => ({ key: t.id, title: t.name, icon: <TagsOutlined />, children }));

const collectionsToTreeData = (collections: Collection[]): DataNode[] =>
  mapTree(collections, (c, children) => ({ key: c.id, title: c.name, icon: <FolderOutlined />, children }));

function SidebarContent({onFilter}: { onFilter?: () => void }) {
  const queryClient = useQueryClient();
  const { tags, collections, isLoading } = useGroups();
  const { selectedTags, selectedCollections, toggleTag, toggleCollection } = useGroupFilters();
  const [groupModal, setGroupModal] = useState<{ type: 'tag' | 'collection'; open: boolean }>({ type: 'tag', open: false });
  const [tagsCollapsed, setTagsCollapsed] = useState(false);
  const [collectionsCollapsed, setCollectionsCollapsed] = useState(false);

  const collectionsTreeData = useMemo(() => collectionsToTreeData(collections), [collections]);
  const tagsTreeData = useMemo(() => tagsToTreeData(tags), [tags]);

  const refreshTagsMutation = useMutation({
    mutationFn: refreshTags,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.tags() }),
  });

  const refreshCollectionsMutation = useMutation({
    mutationFn: refreshCollections,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.collections() }),
  });

  const handleTagSelect = (_: React.Key[], info: { node: { key: React.Key } }) => {
    toggleTag(info.node.key.toString());
    onFilter?.();
  };

  const handleCollectionSelect = (_: React.Key[], info: { node: { key: React.Key } }) => {
    toggleCollection(info.node.key.toString());
    onFilter?.();
  };

  return (
      <ConfigProvider theme={treeTheme}>
        <div style={{padding: '16px 12px', height: '100%', overflow: 'auto'}}>
          {/* Collections section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: '0 8px'
          }}>
            <button
                onClick={() => setCollectionsCollapsed(!collectionsCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
            >
              {collectionsCollapsed ? <RightOutlined style={{fontSize: 10, color: 'var(--text-muted)'}}/> :
                  <DownOutlined style={{fontSize: 10, color: 'var(--text-muted)'}}/>}
              <Text strong style={{
                fontSize: 'var(--font-size-xxs)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)'
              }}>Collections</Text>
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
              <Tooltip title="Manage collections">
                <Link to="/settings?tab=collections" style={{display: 'inline-flex'}}>
                  <Button type="text" size="small" style={{
                    fontSize: 'var(--font-size-xxs)',
                    color: 'var(--text-muted)',
                    padding: '0 4px',
                    height: 22
                  }}>Manage</Button>
                </Link>
              </Tooltip>
              <Tooltip title="Refresh collections">
                <Button type="text" size="small" icon={<ReloadOutlined/>} onClick={() => refreshCollectionsMutation.mutate()}
                        loading={refreshCollectionsMutation.isPending}/>
              </Tooltip>
              <Tooltip title="Add collection">
                <Button type="text" size="small" icon={<PlusOutlined/>}
                        onClick={() => setGroupModal({type: 'collection', open: true})}/>
              </Tooltip>
            </div>
          </div>

          {!collectionsCollapsed && (
              isLoading ? (
                  <div style={{textAlign: 'center', padding: 24}}><Spin size="small"/></div>
              ) : collections.length === 0 ? (
                  <Text type="secondary" style={{padding: '8px 16px', display: 'block', fontSize: 'var(--font-size-sm)'}}>No
                    collections yet</Text>
              ) : (
                  <Tree
                      className="sidebar-tree"
                      treeData={collectionsTreeData}
                      selectedKeys={selectedCollections}
                      onSelect={handleCollectionSelect}
                      showIcon
                      switcherIcon={treeSwitcherIcon}
                      blockNode
                      multiple
                      defaultExpandAll
                  />
              )
          )}

          {/* Tags section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 28,
            marginBottom: 10,
            padding: '0 8px'
          }}>
            <button
                onClick={() => setTagsCollapsed(!tagsCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
            >
              {tagsCollapsed ? <RightOutlined style={{fontSize: 10, color: 'var(--text-muted)'}}/> :
                  <DownOutlined style={{fontSize: 10, color: 'var(--text-muted)'}}/>}
              <Text strong style={{
                fontSize: 'var(--font-size-xxs)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)'
              }}>Tags</Text>
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
              <Tooltip title="Manage tags">
                <Link to="/settings?tab=tags" style={{display: 'inline-flex'}}>
                  <Button type="text" size="small" style={{
                    fontSize: 'var(--font-size-xxs)',
                    color: 'var(--text-muted)',
                    padding: '0 4px',
                    height: 22
                  }}>Manage</Button>
                </Link>
              </Tooltip>
              <Tooltip title="Refresh tags">
                <Button type="text" size="small" icon={<ReloadOutlined/>} onClick={() => refreshTagsMutation.mutate()}
                        loading={refreshTagsMutation.isPending}/>
              </Tooltip>
              <Tooltip title="Add tag">
                <Button type="text" size="small" icon={<PlusOutlined/>}
                        onClick={() => setGroupModal({type: 'tag', open: true})}/>
              </Tooltip>
            </div>
          </div>

          {!tagsCollapsed && (
              isLoading ? (
                  <div style={{textAlign: 'center', padding: 24}}><Spin size="small"/></div>
              ) : tags.length === 0 ? (
                  <Text type="secondary" style={{padding: '8px 16px', display: 'block', fontSize: 'var(--font-size-sm)'}}>No tags
                    yet</Text>
              ) : (
                  <Tree
                      className="sidebar-tree"
                      treeData={tagsTreeData}
                      selectedKeys={selectedTags}
                      onSelect={handleTagSelect}
                      showIcon
                      switcherIcon={treeSwitcherIcon}
                      blockNode
                      multiple
                  />
              )
          )}

          <GroupModal
              type={groupModal.type}
              open={groupModal.open}
              onClose={() => setGroupModal({...groupModal, open: false})}
              collections={collections}
          />
        </div>
      </ConfigProvider>
  );
}

export default function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebarStore();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile, setCollapsed]);

  if (isMobile) {
    const close = () => setCollapsed(true);
    const selected = selectedNavKey(location.pathname);
    return (
      <Drawer
        placement="left"
        open={!collapsed}
        onClose={close}
        size={300}
        closable={false}
        rootClassName="sidebar-drawer"
        styles={{ body: { padding: 0 } }}
      >
        <div className="sidebar-drawer-head">
          <img src="/favicon.svg" alt="" width={28} height={28} style={{ borderRadius: 7 }} />
          <span className="sidebar-drawer-brand">Lynks</span>
          <Button type="text" icon={<CloseOutlined />} onClick={close} aria-label="Close menu" />
        </div>
        <Menu
          mode="inline"
          selectedKeys={selected ? [selected] : []}
          items={NAV_ITEMS.map(({ key, label, icon }) => ({ key, label, icon }))}
          onClick={({ key }) => { navigate(key); close(); }}
          style={{ borderRight: 'none', borderBottom: '1px solid var(--border-primary)' }}
        />
        <SidebarContent onFilter={close} />
      </Drawer>
    );
  }

  if (collapsed) return null;

  return (
    <Layout.Sider
      width={280}
      className="app-sider"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-primary)',
        overflow: 'auto',
        height: 'calc(100vh - 60px)',
        position: 'sticky',
        top: 60,
        left: 0,
      }}
    >
      <SidebarContent />
    </Layout.Sider>
  );
}

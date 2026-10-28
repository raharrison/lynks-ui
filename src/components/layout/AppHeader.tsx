import {useMemo, useState} from 'react';
import {Avatar, Badge, Button, Dropdown, Input, Layout, Menu, Segmented, Typography} from 'antd';
import {
  BellOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  HistoryOutlined,
  LoadingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons';
import {useIsFetching} from '@tanstack/react-query';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {useSidebarStore} from '@/stores/sidebarStore';
import {buildFilterUrl, LIST_PATHS} from '@/hooks/useUrlFilterSync';
import {useAuthStore} from '@/stores/authStore';
import type {ThemeMode} from '@/stores/themeStore';
import {useThemeStore} from '@/stores/themeStore';
import {useUnreadCount} from '@/hooks/useUnreadCount';
import {entryCreatePath} from '@/utils/format';
import {CREATE_ITEMS, NAV_ITEMS, selectedNavKey, useSignOut} from './navigation';

const themeOptions: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <SunOutlined />, label: 'Light' },
  { value: 'system', icon: <DesktopOutlined />, label: 'System' },
  { value: 'dark', icon: <MoonOutlined />, label: 'Dark' },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { collapsed, toggle } = useSidebarStore();
  const searchQuery = searchParams.get('q') || '';
  const { user } = useAuthStore();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const { unread } = useUnreadCount();
  const handleLogout = useSignOut();
  const isFetchingEntries = useIsFetching({ queryKey: ['entries'] }) > 0;
  const [localSearch, setLocalSearch] = useState(searchQuery);
    const [lastSearchQuery, setLastSearchQuery] = useState(searchQuery);

    if (searchQuery !== lastSearchQuery) {
        setLastSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
    }

  const handleSearch = (value: string) => {
    const onListPage = LIST_PATHS.includes(location.pathname);
    const basePath = onListPage ? location.pathname : '/';
    navigate(buildFilterUrl({ searchQuery: value }, basePath, location.search));
  };

  const displayName = user?.displayName || user?.username || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  const createMenuItems = useMemo(() => CREATE_ITEMS.map((item) => ({
    key: item.type, icon: item.icon, label: `New ${item.label}`, onClick: () => navigate(entryCreatePath(item.type)),
  })), [navigate]);

  const selectedNavKeys = useMemo(() => {
    const key = selectedNavKey(location.pathname);
    return key ? [key] : [];
  }, [location.pathname]);

  const themeIcon = useMemo(
    () => themeMode === 'dark' ? <MoonOutlined /> : themeMode === 'light' ? <SunOutlined /> : <DesktopOutlined />,
    [themeMode]);


  const userMenuItems = useMemo(() => [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Typography.Text strong>{displayName}</Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'theme',
      icon: themeIcon,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>Theme</span>
          <Segmented
            size="small"
            value={themeMode}
            onChange={(val) => setThemeMode(val as ThemeMode)}
            options={themeOptions.map(o => ({ value: o.value, icon: o.icon }))}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    { type: 'divider' as const },
      {key: 'reminders', icon: <ClockCircleOutlined/>, label: <Link to="/reminders" style={{color: 'inherit'}}>Reminders</Link>},
    { key: 'settings', icon: <SettingOutlined />, label: <Link to="/settings" style={{ color: 'inherit' }}>Settings</Link> },
    { key: 'activity', icon: <HistoryOutlined />, label: <Link to="/settings?tab=activity" style={{ color: 'inherit' }}>Activity</Link> },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout, danger: true },
  ], [displayName, themeMode, themeIcon, setThemeMode, handleLogout]);

  return (
      <Layout.Header className="app-header" style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Left: toggle + brand + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, overflow: 'hidden' }}>
        <Button
          className="desktop-only"
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ fontSize: 16 }}
        />

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
              gap: 9,
            textDecoration: 'none',
          }}
          aria-label="Lynks home"
        >
            <img
                src="/favicon.svg"
                alt=""
                width={28}
                height={28}
                style={{display: 'block', borderRadius: 7}}
            />
          <span className="app-header-brand desktop-only" style={{
            fontWeight: 800,
            fontSize: 20,
              color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.5px',
          }}>
            Lynks
          </span>
        </Link>

        <Menu
          className="desktop-only"
          mode="horizontal"
          selectedKeys={selectedNavKeys}
          onClick={({ key }) => navigate(key)}
          disabledOverflow
          items={NAV_ITEMS.map(n => ({ key: n.key, label: n.label, style: { padding: '0 12px' } }))}
          style={{background: 'transparent', borderBottom: 'none', minWidth: 0, flex: 'none', lineHeight: '59px'}}
        />
      </div>

      {/* Center: search */}
        <div className="app-header-search">
        <Input
          id="search-input"
          prefix={<SearchOutlined style={{ color: 'var(--accent)', fontSize: 'var(--font-size-md)' }} />}
          suffix={isFetchingEntries ? <LoadingOutlined style={{ color: 'var(--accent)' }} /> : undefined}
          placeholder="Search entries..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onPressEnter={(e) => {
            const input = e.target as HTMLInputElement;
            handleSearch(input.value);
            // dismisses the on-screen keyboard so the results are visible
            if (window.matchMedia('(pointer: coarse)').matches) input.blur();
          }}
          enterKeyHint="search"
          inputMode="search"
          allowClear
          onClear={() => handleSearch('')}
          size="large"
          style={{
            borderRadius: 24,
            background: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
          }}
        />
      </div>

      {/* Right: actions. On a phone these live in the tab bar instead. */}
      <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
        <Dropdown menu={{ items: createMenuItems }} trigger={['click']}>
          <Button type="primary" icon={<PlusOutlined />} size="middle" style={{ borderRadius: 'var(--radius-pill)' }}
                  aria-label="Create">
            <span className="app-header-create-label">Create</span>
          </Button>
        </Dropdown>

        <Link to="/notifications" style={{ display: 'inline-flex' }} aria-label="Notifications">
          <Badge count={unread} size="small" offset={[-4, 4]}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: 16 }}
            />
          </Badge>
        </Link>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <button type="button" className="app-header-user">
              <Avatar size={32}
                      style={{background: 'var(--accent-solid)', color: 'var(--accent-ink)', fontSize: 14, fontWeight: 700}}>
              {initials}
            </Avatar>
            <Typography.Text style={{ fontSize: 'var(--font-size-sm)', maxWidth: 100 }} ellipsis>
              {displayName}
            </Typography.Text>
          </button>
        </Dropdown>
      </div>
    </Layout.Header>
  );
}

import {useState} from 'react';
import {Avatar, Badge, Segmented} from 'antd';
import {
    AppstoreOutlined,
    BellOutlined,
    ClockCircleOutlined,
    DesktopOutlined,
    HistoryOutlined,
    HomeOutlined,
    LogoutOutlined,
    MoonOutlined,
    PlusOutlined,
    RightOutlined,
    SettingOutlined,
    SunOutlined,
} from '@ant-design/icons';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import BottomSheet from '@/components/common/BottomSheet';
import {useSidebarStore} from '@/stores/sidebarStore';
import {useAuthStore} from '@/stores/authStore';
import type {ThemeMode} from '@/stores/themeStore';
import {useThemeStore} from '@/stores/themeStore';
import {useUnreadCount} from '@/hooks/useUnreadCount';
import {entryCreatePath} from '@/utils/format';
import {CREATE_ITEMS, useSignOut} from './navigation';

const ACCOUNT_PATHS = ['/settings', '/reminders'];

function TabButton({label, active, onClick, children}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button type="button" className={`tab-bar-item${active ? ' tab-bar-item--active' : ''}`} onClick={onClick}
                aria-label={label} aria-current={active ? 'page' : undefined}>
            <span className="tab-bar-icon">{children}</span>
            <span className="tab-bar-label">{label}</span>
        </button>
    );
}

function CreateSheet({open, onClose}: { open: boolean; onClose: () => void }) {
    const navigate = useNavigate();
    return (
        <BottomSheet open={open} onClose={onClose} title="Create">
            <div className="create-grid">
                {CREATE_ITEMS.map((item) => (
                    <button key={item.type} type="button" className={`create-tile create-tile--${item.type}`}
                            onClick={() => {
                                onClose();
                                navigate(entryCreatePath(item.type));
                            }}>
                        <span className="create-tile-icon">{item.icon}</span>
                        <span className="create-tile-label">New {item.label}</span>
                        <span className="create-tile-description">{item.description}</span>
                    </button>
                ))}
            </div>
        </BottomSheet>
    );
}

const themeOptions: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    {value: 'light', icon: <SunOutlined/>, label: 'Light'},
    {value: 'system', icon: <DesktopOutlined/>, label: 'System'},
    {value: 'dark', icon: <MoonOutlined/>, label: 'Dark'},
];

function AccountSheet({open, onClose, displayName}: { open: boolean; onClose: () => void; displayName: string }) {
    const {mode, setMode} = useThemeStore();
    const signOut = useSignOut();
    const links = [
        {to: '/reminders', icon: <ClockCircleOutlined/>, label: 'Reminders'},
        {to: '/settings', icon: <SettingOutlined/>, label: 'Settings'},
        {to: '/settings?tab=activity', icon: <HistoryOutlined/>, label: 'Activity'},
    ];

    return (
        <BottomSheet open={open} onClose={onClose} title={displayName}>
            <div className="sheet-section-label">Theme</div>
            <Segmented
                block
                value={mode}
                onChange={(val) => setMode(val as ThemeMode)}
                options={themeOptions.map((o) => ({value: o.value, icon: o.icon, label: o.label}))}
                style={{marginBottom: 16}}
            />
            <div className="sheet-list">
                {links.map((l) => (
                    <Link key={l.to} to={l.to} className="sheet-list-item" onClick={onClose}>
                        <span className="sheet-list-icon">{l.icon}</span>
                        <span className="sheet-list-label">{l.label}</span>
                        <RightOutlined className="sheet-list-chevron"/>
                    </Link>
                ))}
                <button type="button" className="sheet-list-item sheet-list-item--danger" onClick={() => {
                    onClose();
                    signOut();
                }}>
                    <span className="sheet-list-icon"><LogoutOutlined/></span>
                    <span className="sheet-list-label">Logout</span>
                </button>
            </div>
        </BottomSheet>
    );
}

/** The phone's primary navigation, in thumb reach. Hidden by CSS above the mobile breakpoint. */
export default function MobileTabBar() {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const {collapsed, setCollapsed} = useSidebarStore();
    const {unread} = useUnreadCount();
    const user = useAuthStore((s) => s.user);
    const [sheet, setSheet] = useState<'create' | 'account' | null>(null);

    const displayName = user?.displayName || user?.username || 'User';
    const onNotifications = pathname.startsWith('/notifications');
    const onAccount = ACCOUNT_PATHS.some((p) => pathname.startsWith(p));
    const onHome = !onNotifications && !onAccount && collapsed && sheet === null;

    return (
        <>
            <nav className="tab-bar" aria-label="Primary">
                <TabButton label="Home" active={onHome} onClick={() => navigate('/')}>
                    <HomeOutlined/>
                </TabButton>
                <TabButton label="Browse" active={!collapsed} onClick={() => setCollapsed(!collapsed)}>
                    <AppstoreOutlined/>
                </TabButton>
                <button type="button" className="tab-bar-create" aria-label="Create" onClick={() => setSheet('create')}>
                    <PlusOutlined/>
                </button>
                <TabButton label="Alerts" active={onNotifications} onClick={() => navigate('/notifications')}>
                    <Badge count={unread} size="small" offset={[4, -2]}><BellOutlined/></Badge>
                </TabButton>
                <TabButton label="Me" active={onAccount || sheet === 'account'} onClick={() => setSheet('account')}>
                    <Avatar size={24} className="tab-bar-avatar">{displayName.charAt(0).toUpperCase()}</Avatar>
                </TabButton>
            </nav>
            <CreateSheet open={sheet === 'create'} onClose={() => setSheet(null)}/>
            <AccountSheet open={sheet === 'account'} onClose={() => setSheet(null)} displayName={displayName}/>
        </>
    );
}

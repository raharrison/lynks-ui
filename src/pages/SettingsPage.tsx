import {useEffect} from 'react';
import {Card, Divider, Space, Tabs, Typography} from 'antd';
import {useNavigate, useSearchParams} from 'react-router-dom';
import ProfileSettings from './settings/ProfileSettings';
import PasswordSettings from './settings/PasswordSettings';
import JoltSettings from './settings/JoltSettings';
import TwoFactorSettings from './settings/TwoFactorSettings';
import SessionSettings from './settings/SessionSettings';
import TagManagement from './settings/TagManagement';
import CollectionManagement from './settings/CollectionManagement';
import ActivityLog from './settings/ActivityLog';

const TAB_LABELS: Record<string, string> = {
    profile: 'Profile', security: 'Security',
    tags: 'Tags', collections: 'Collections', activity: 'Activity',
};

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'profile';

    useEffect(() => {
        document.title = `Settings - ${TAB_LABELS[activeTab] ?? 'Settings'} - Lynks`;
    }, [activeTab]);

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>Settings</Typography.Title>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => navigate(`/settings?tab=${key}`, { replace: true })}
        size="large"
        items={[
          {
            key: 'profile',
            label: 'Profile',
            children: (
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <ProfileSettings />
                <Divider />
                  <Typography.Title level={5}>Jolt Notifications</Typography.Title>
                  <JoltSettings/>
              </Card>
            ),
          },
          {
            key: 'security',
            label: 'Security',
            children: (
                <Space orientation="vertical" size="large" style={{width: '100%'}}>
                    <Card title="Change Password" style={{borderRadius: 'var(--radius-lg)'}}>
                        <PasswordSettings/>
                    </Card>
                    <Card title="Two-Factor Authentication" style={{borderRadius: 'var(--radius-lg)'}}>
                        <TwoFactorSettings/>
                    </Card>
                    <Card title="Active Sessions" style={{borderRadius: 'var(--radius-lg)'}}>
                        <SessionSettings/>
                    </Card>
                </Space>
            ),
          },
          {
            key: 'tags',
            label: 'Tags',
            children: (
              <Card title="Manage Tags" style={{ borderRadius: 'var(--radius-lg)' }}>
                <TagManagement />
              </Card>
            ),
          },
          {
            key: 'collections',
            label: 'Collections',
            children: (
              <Card title="Manage Collections" style={{ borderRadius: 'var(--radius-lg)' }}>
                <CollectionManagement />
              </Card>
            ),
          },
          {
            key: 'activity',
            label: 'Activity',
            children: (
              <Card title="Recent Activity" style={{ borderRadius: 'var(--radius-lg)' }}>
                <ActivityLog />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}

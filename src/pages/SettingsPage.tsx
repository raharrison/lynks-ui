import { Card, Divider, Tabs, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProfileSettings from './settings/ProfileSettings';
import PasswordSettings from './settings/PasswordSettings';
import TwoFactorSettings from './settings/TwoFactorSettings';
import TagManagement from './settings/TagManagement';
import CollectionManagement from './settings/CollectionManagement';
import ActivityLog from './settings/ActivityLog';

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'profile';

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
                <Typography.Title level={5}>Change Password</Typography.Title>
                <PasswordSettings />
              </Card>
            ),
          },
          {
            key: 'security',
            label: 'Security',
            children: (
              <Card title="Two-Factor Authentication" style={{ borderRadius: 'var(--radius-lg)' }}>
                <TwoFactorSettings />
              </Card>
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

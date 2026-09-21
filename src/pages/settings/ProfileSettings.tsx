import {App, Button, Form, Input, Result, Skeleton, Switch, Typography} from 'antd';
import {SaveOutlined} from '@ant-design/icons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getCurrentUser, updateUser} from '@/api/user';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';

export default function ProfileSettings() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: QK.user(),
    queryFn: getCurrentUser,
  });

  const updateMutation = useMutation({
      mutationFn: (values: { displayName?: string; digest: boolean }) =>
      updateUser({ username: user!.username, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.user() });
      message.success('Profile updated');
    },
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to update profile')),
  });

  if (isLoading) return <Skeleton active />;
  if (isError) return <Result status="error" title="Failed to load profile" />;

  return (
    <Form
      form={form}
      onFinish={(v) => updateMutation.mutate(v)}
      layout="vertical"
      initialValues={{
        displayName: user?.displayName || '',
        digest: user?.digest || false,
      }}
    >
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 14 }}>
        Username: <Typography.Text strong>{user?.username}</Typography.Text>
      </Typography.Text>
      <Form.Item name="displayName" label="Display Name">
        <Input placeholder="Your display name" />
      </Form.Item>
        <Form.Item name="digest" label="Digest Notifications" valuePropName="checked"
                   extra="Get notified when the weekly digest of unread links is regenerated">
        <Switch />
      </Form.Item>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updateMutation.isPending}
              style={{ borderRadius: 'var(--radius-pill)' }}>
        Save Profile
      </Button>
    </Form>
  );
}

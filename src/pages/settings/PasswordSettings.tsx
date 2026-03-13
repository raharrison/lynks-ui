import { App, Button, Form, Input } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { changePassword, getCurrentUser } from '@/api/user';
import { QK } from '@/utils/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';

export default function PasswordSettings() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { data: user } = useQuery({ queryKey: QK.user(), queryFn: getCurrentUser });

  const mutation = useMutation({
    mutationFn: (values: { oldPassword: string; newPassword: string }) =>
      changePassword({ username: user!.username, ...values }),
    onSuccess: () => {
      form.resetFields();
      message.success('Password changed successfully');
    },
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to change password. Check your current password.')),
  });

  return (
    <Form form={form} onFinish={(v) => mutation.mutate(v)} layout="vertical">
      <Form.Item name="oldPassword" label="Current Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item name="confirmPassword" label="Confirm New Password"
                 dependencies={['newPassword']}
                 rules={[
                   { required: true, message: 'Please confirm your password' },
                   ({ getFieldValue }) => ({
                     validator(_, value) {
                       if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                       return Promise.reject(new Error('Passwords do not match'));
                     },
                   }),
                 ]}>
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={mutation.isPending} style={{ borderRadius: 'var(--radius-pill)' }}>
        Change Password
      </Button>
    </Form>
  );
}

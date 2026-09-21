import {useEffect, useState} from 'react';
import {App, Button, Card, Form, Input, Typography} from 'antd';
import {LockOutlined, SafetyOutlined, UserOutlined} from '@ant-design/icons';
import {useQueryClient} from '@tanstack/react-query';
import {useLogin} from '@/hooks/useAuth';
import {checkCurrentUser} from '@/api/user';
import {QK} from '@/utils/queryKeys';

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Login - Lynks';
  }, []);
  const [needsTotp, setNeedsTotp] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { message } = App.useApp();
  const { loginAsync, isPending } = useLogin();
  const queryClient = useQueryClient();

  const completeLogin = async () => {
    const user = await checkCurrentUser();
    // Updating the cache triggers AuthGate's query subscription, which navigates away
    queryClient.setQueryData(QK.user(), user);
  };

  const handleLogin = async (values: { username: string; password: string; totp?: string }) => {
    try {
      const { result } = await loginAsync(values);
      if (result === 'success') {
        await completeLogin();
      } else if (result === 'totp_required') {
        setNeedsTotp(true);
        setCredentials({ username: values.username, password: values.password });
      } else {
        message.error('Invalid credentials');
      }
    } catch {
      message.error('Login failed');
    }
  };

  const handleTotp = async (values: { totp: string }) => {
    try {
      const { result } = await loginAsync({ ...credentials, totp: values.totp });
      if (result === 'success') {
        await completeLogin();
      } else {
        message.error('Invalid code');
      }
    } catch {
      message.error('Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <Card style={{
        width: 420,
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 16,
        border: '1px solid var(--border-secondary)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img
                src="/favicon.svg"
                alt=""
                width={56}
                height={56}
                style={{display: 'block', margin: '0 auto 14px', borderRadius: 13}}
            />
          <div style={{
            fontWeight: 800,
            fontSize: 32,
              color: 'var(--text-primary)',
              letterSpacing: '-1px',
            marginBottom: 8,
          }}>
            Lynks
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>Sign in to your account</Typography.Text>
        </div>

        {!needsTotp ? (
          <Form onFinish={handleLogin} layout="vertical" size="large">
            <Form.Item name="username" rules={[{ required: true, message: 'Username required' }]}>
              <Input prefix={<UserOutlined />} placeholder="Username" autoFocus style={{ borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Password required' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" style={{ borderRadius: 10 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isPending} block style={{ borderRadius: 10, height: 44 }}>
                Sign In
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form onFinish={handleTotp} layout="vertical" size="large">
            <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
              Enter your two-factor authentication code
            </Typography.Paragraph>
            <Form.Item name="totp" rules={[{ required: true, message: 'Code required' }]}>
              <Input prefix={<SafetyOutlined />} placeholder="Authentication code" autoFocus style={{ borderRadius: 10 }} />
            </Form.Item>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button type="primary" htmlType="submit" loading={isPending} block style={{ borderRadius: 10, height: 44 }}>
                Verify
              </Button>
              <Button type="text" block onClick={() => { setNeedsTotp(false); setCredentials({ username: '', password: '' }); }}>
                Back to login
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}

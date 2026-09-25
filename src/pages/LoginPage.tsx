import {useEffect, useState} from 'react';
import {Alert, App, Button, Card, Divider, Form, Input, Typography} from 'antd';
import {LockOutlined, LoginOutlined, SafetyOutlined, UserOutlined} from '@ant-design/icons';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useSearchParams} from 'react-router-dom';
import {useLogin} from '@/hooks/useAuth';
import {checkCurrentUser, getAuthConfig, ssoLoginUrl} from '@/api/user';
import {QK} from '@/utils/queryKeys';
import {safeReturnTo} from '@/utils/returnTo';

// The codes the server's single sign-on callback redirects here with
const SSO_MESSAGES: Record<string, string> = {
    unlinked: 'No Lynks account matches that sign-on. Its username has to match a Lynks username exactly.',
    denied: 'Single sign-on was refused for this account.',
    expired: 'The sign-on attempt expired or was started in another browser. Try again.',
    unavailable: 'The sign-on provider cannot be reached right now. Try again later.',
    failed: 'Single sign-on failed. Try again.',
};

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Login - Lynks';
  }, []);
  const [needsTotp, setNeedsTotp] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { message } = App.useApp();
  const { loginAsync, isPending } = useLogin();
  const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const ssoCode = searchParams.get('sso');
    const ssoMessage = ssoCode ? SSO_MESSAGES[ssoCode] ?? SSO_MESSAGES.failed : null;
    const returnTo = safeReturnTo(searchParams.get('returnTo'));

    // Without the config the password form is still the way in, so a failure falls back to it
    const {data: config} = useQuery({
        queryKey: QK.authConfig(),
        queryFn: getAuthConfig,
        retry: false,
    });
    const passwordLogin = config?.passwordLogin ?? true;
    const sso = config?.sso ?? null;

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

          {ssoMessage && (
              <Alert type="error" showIcon title={ssoMessage} style={{marginBottom: 24, borderRadius: 10}}/>
          )}

          {sso && !needsTotp && (
              <>
                  <Button
                      type={passwordLogin ? 'default' : 'primary'}
                      size="large"
                      block
                      icon={<LoginOutlined/>}
                      href={ssoLoginUrl(returnTo === '/' ? null : returnTo)}
                      style={{borderRadius: 10, height: 44}}
                  >
                      {sso.label}
                  </Button>
                  {passwordLogin && <Divider plain><Typography.Text type="secondary">or</Typography.Text></Divider>}
              </>
          )}

          {passwordLogin && (!needsTotp ? (
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
          ))}
      </Card>
    </div>
  );
}

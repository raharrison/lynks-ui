import {useState} from 'react';
import {Alert, App, Button, Card, Divider, Input, Popconfirm, Skeleton, Typography} from 'antd';
import {CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined} from '@ant-design/icons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {get2FASecret, get2FAStatus, update2FA, validate2FACode} from '@/api/user';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';

export default function TwoFactorSettings() {
  const { message } = App.useApp();
  const [verifyCode, setVerifyCode] = useState('');
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: QK.twoFaStatus(),
    queryFn: get2FAStatus,
  });

    // The secret only exists once 2FA is on - enabling is what generates it server side
  const { data: secretData } = useQuery({
    queryKey: QK.twoFaSecret(),
    queryFn: get2FASecret,
      enabled: status?.enabled === true,
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => update2FA(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.twoFaStatus() });
      queryClient.invalidateQueries({ queryKey: QK.twoFaSecret() });
      message.success(status?.enabled ? '2FA disabled' : '2FA enabled');
    },
      onError: (err) => {
          message.error(getApiErrorMessage(err, 'Failed to update 2FA'));
      },
  });

  const validateMutation = useMutation({
    mutationFn: (code: string) => validate2FACode(code),
    onSuccess: ({ valid }) => {
      if (valid) {
        message.success('Code is valid');
      } else {
        message.error('Invalid code');
      }
    },
      onError: (err) => {
          message.error(getApiErrorMessage(err, 'Failed to validate code'));
      },
  });

  if (isLoading) return <Skeleton active />;

  const enabled = status?.enabled ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Alert
        type={enabled ? 'success' : 'info'}
        icon={enabled ? <CheckCircleOutlined /> : <SafetyOutlined />}
        showIcon
        title={enabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
        description={enabled
          ? 'Your account is protected with an additional authentication step.'
          : 'Enable 2FA to add an extra layer of security to your account.'
        }
        style={{ borderRadius: 10 }}
      />

        {enabled && secretData?.secret && (
        <Card title="Setup" style={{ borderRadius: 'var(--radius-lg)' }}>
          <Typography.Paragraph>
            Add this secret to your authenticator app:
          </Typography.Paragraph>
          <Typography.Text code copyable style={{ fontSize: 16 }}>
            {secretData.secret}
          </Typography.Text>
          <Divider />
          <Typography.Text>Verify a code to confirm setup:</Typography.Text>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Input
              placeholder="Enter code"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              style={{ width: 180 }}
            />
            <Button onClick={() => validateMutation.mutate(verifyCode)}
                    loading={validateMutation.isPending}
                    disabled={!verifyCode}>
              Verify
            </Button>
          </div>
        </Card>
      )}

      <Popconfirm
        title={enabled ? 'Disable 2FA?' : 'Enable 2FA?'}
        description={enabled ? 'This will remove the extra security layer and discard the current secret.' : 'A new secret will be generated for your authenticator app.'}
        onConfirm={() => toggleMutation.mutate(!enabled)}
        okText={enabled ? 'Disable' : 'Enable'}
        okButtonProps={enabled ? { danger: true } : {}}
      >
        <Button
          type={enabled ? 'default' : 'primary'}
          danger={enabled}
          icon={enabled ? <CloseCircleOutlined /> : <SafetyOutlined />}
          loading={toggleMutation.isPending}
          style={{ borderRadius: 'var(--radius-pill)', alignSelf: 'flex-start' }}
        >
          {enabled ? 'Disable 2FA' : 'Enable 2FA'}
        </Button>
      </Popconfirm>
    </div>
  );
}

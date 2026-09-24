import {useState} from 'react';
import {App, Button, Input, Popconfirm, Space, Typography} from 'antd';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getCurrentUser, setJoltToken} from '@/api/user';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';

export default function JoltSettings() {
    const {message} = App.useApp();
    const queryClient = useQueryClient();
    const [token, setToken] = useState('');
    const {data: user} = useQuery({queryKey: QK.user(), queryFn: getCurrentUser});

    const mutation = useMutation({
        mutationFn: (value: string | null) => setJoltToken(value),
        onSuccess: (updated) => {
            queryClient.setQueryData(QK.user(), updated);
            setToken('');
            message.success(updated.joltConfigured ? 'Jolt token saved' : 'Jolt token removed');
        },
        onError: (err) => {
            message.error(getApiErrorMessage(err, 'Failed to update Jolt token'));
        },
    });

    return (
        <div>
            <Typography.Paragraph type="secondary">
                Reminders sent with Jolt go to your own Jolt inbound channel.{' '}
                {user?.joltConfigured ? 'A token is set.' : 'No token is set, so Jolt reminders are skipped.'}
            </Typography.Paragraph>
            <Space.Compact style={{width: '100%', maxWidth: 480}}>
                {/* the server never returns the saved token, so this only ever replaces it */}
                <Input.Password
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={user?.joltConfigured ? 'Enter a new token to replace it' : 'Inbound channel token'}
                    autoComplete="off"
                />
                <Button type="primary" disabled={!token.trim()} loading={mutation.isPending}
                        onClick={() => mutation.mutate(token)}>
                    Save
                </Button>
            </Space.Compact>
            {user?.joltConfigured && (
                <Popconfirm title="Remove your Jolt token?" onConfirm={() => mutation.mutate(null)}>
                    <Button danger type="link" style={{paddingLeft: 0, marginTop: 8}}>Remove token</Button>
                </Popconfirm>
            )}
        </div>
    );
}

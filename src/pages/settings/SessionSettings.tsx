import {App, Button, Empty, Popconfirm, Result, Spin, Tag, Typography} from 'antd';
import {LogoutOutlined} from '@ant-design/icons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getSessions, revokeOtherSessions, revokeSession} from '@/api/user';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';
import {formatRelative} from '@/utils/format';
import {describeUserAgent} from '@/utils/userAgent';

const METHOD_LABELS = {password: 'Password', oidc: 'Single sign-on'} as const;

export default function SessionSettings() {
    const {message} = App.useApp();
    const queryClient = useQueryClient();
    const {data: sessions, isLoading, isError} = useQuery({queryKey: QK.sessions(), queryFn: getSessions});

    const revokeMutation = useMutation({
        mutationFn: revokeSession,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: QK.sessions()});
            message.success('Session signed out');
        },
        onError: (err) => {
            message.error(getApiErrorMessage(err, 'Failed to sign out session'));
        },
    });

    const revokeOthersMutation = useMutation({
        mutationFn: revokeOtherSessions,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: QK.sessions()});
            message.success('Signed out of every other session');
        },
        onError: (err) => {
            message.error(getApiErrorMessage(err, 'Failed to sign out other sessions'));
        },
    });

    if (isError) return <Result status="error" title="Failed to load sessions"/>;
    if (isLoading) return <Spin style={{display: 'block', textAlign: 'center', padding: 24}}/>;

    const items = sessions ?? [];
    const hasOthers = items.some((session) => !session.current);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {items.length === 0 ? (
                <Empty description="No active sessions" style={{padding: '24px 0'}}/>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                    {items.map((session) => (
                        <div
                            key={session.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                border: '1px solid var(--border-secondary)',
                                background: 'var(--bg-surface)',
                            }}
                        >
                            <div style={{flex: 1, minWidth: 0}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap'}}>
                                    <Typography.Text style={{fontSize: 'var(--font-size-sm)'}}
                                                     title={session.userAgent ?? undefined}>
                                        {describeUserAgent(session.userAgent)}
                                    </Typography.Text>
                                    {session.current && (
                                        <Tag className="lynks-chip lynks-chip-accent"
                                             style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>This device</Tag>
                                    )}
                                </div>
                                <Typography.Text type="secondary" style={{fontSize: 'var(--font-size-xs)'}}>
                                    {METHOD_LABELS[session.method]}
                                    {session.ip && ` · ${session.ip}`}
                                    {` · active ${formatRelative(session.lastSeen)}`}
                                </Typography.Text>
                            </div>
                            {!session.current && (
                                <Popconfirm title="Sign out this session?" okText="Sign out"
                                            onConfirm={() => revokeMutation.mutate(session.id)}>
                                    <Button size="small" aria-label={`Sign out ${describeUserAgent(session.userAgent)}`}>
                                        Sign out
                                    </Button>
                                </Popconfirm>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {hasOthers && (
                <Popconfirm title="Sign out of every other session?" okText="Sign out"
                            onConfirm={() => revokeOthersMutation.mutate()}>
                    <Button danger icon={<LogoutOutlined/>} loading={revokeOthersMutation.isPending}
                            style={{borderRadius: 'var(--radius-pill)', alignSelf: 'flex-start'}}>
                        Sign out other sessions
                    </Button>
                </Popconfirm>
            )}
        </div>
    );
}

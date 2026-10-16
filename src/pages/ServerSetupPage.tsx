import {useEffect, useState} from 'react';
import {Alert, Button, Card, Form, Input, Typography} from 'antd';
import {CloudServerOutlined} from '@ant-design/icons';
import {normaliseServerUrl, probeServer, setServerUrl} from '@/lib/server';

// Outside the router, since nothing can issue a request until this has stored a server
export default function ServerSetupPage() {
    useEffect(() => {
        document.title = 'Connect - Lynks';
    }, []);
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    const insecure = /^http:\/\//i.test(value.trim());

    const connect = async () => {
        setError(null);
        let root: string;
        try {
            root = normaliseServerUrl(value);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'That is not a valid address');
            return;
        }

        setConnecting(true);
        const result = await probeServer(root);
        setConnecting(false);
        if (!result.ok) {
            setError(result.reason === 'not-lynks'
                ? `${root} answered, but it is not a Lynks server.`
                : `Could not reach ${root}. Check the address and that the server is running.`);
            return;
        }
        await setServerUrl(root);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'var(--bg-primary)',
        }}>
            <Card style={{
                width: 420,
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 16,
                border: '1px solid var(--border-secondary)',
            }}>
                <div style={{textAlign: 'center', marginBottom: 32}}>
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
                    <Typography.Text type="secondary" style={{fontSize: 14}}>Connect to your server</Typography.Text>
                </div>

                {error && <Alert type="error" showIcon title={error} style={{marginBottom: 24, borderRadius: 10}}/>}

                <Form onFinish={connect} layout="vertical" size="large">
                    <Form.Item
                        label="Server address"
                        htmlFor="server"
                        extra="Where Lynks is running. https:// is assumed if you leave the scheme off."
                    >
                        <Input
                            id="server"
                            inputMode="url"
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoFocus
                            prefix={<CloudServerOutlined/>}
                            placeholder="lynks.example.com"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            style={{borderRadius: 10}}
                        />
                    </Form.Item>

                    {insecure && (
                        <Alert
                            type="warning"
                            showIcon
                            title="Plain HTTP works, but your session token crosses the network in the clear."
                            style={{marginBottom: 24, borderRadius: 10}}
                        />
                    )}

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={connecting}
                        disabled={!value.trim()}
                        block
                        style={{borderRadius: 10, height: 44}}
                    >
                        Connect
                    </Button>
                </Form>
            </Card>
        </div>
    );
}

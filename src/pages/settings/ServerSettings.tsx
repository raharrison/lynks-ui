import {Button, Popconfirm, Typography} from 'antd';
import {CloudServerOutlined} from '@ant-design/icons';
import {logout} from '@/api/user';
import {clearServerUrl, useServerRoot} from '@/lib/server';

export default function ServerSettings() {
    const root = useServerRoot();

    const switchServer = async () => {
        try {
            await logout();
        } catch {
            // best effort, since an unreachable server is a common reason to switch
        }
        await clearServerUrl();
        // a fresh start, so nothing cached from one server shows against the next
        window.location.replace('/');
    };

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
            <CloudServerOutlined style={{fontSize: 18, color: 'var(--text-secondary)'}}/>
            <Typography.Text strong style={{flex: 1, minWidth: 0}} ellipsis>{root}</Typography.Text>
            <Popconfirm
                title="Switch to a different server?"
                description={`You will be signed out of ${root} and asked for a new address.`}
                okText="Switch"
                onConfirm={switchServer}
            >
                <Button>Switch server</Button>
            </Popconfirm>
        </div>
    );
}

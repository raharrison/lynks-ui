import {Descriptions, Typography} from 'antd';
import {useQuery} from '@tanstack/react-query';
import {getHealth} from '@/api/health';
import {APP_VERSION, BUILD_TIME} from '@/lib/version';
import {formatDateTime} from '@/utils/format';
import {QK} from '@/utils/queryKeys';

export default function AboutSettings() {
    const {data: health, isLoading, isError} = useQuery({queryKey: QK.health(), queryFn: getHealth});

    const serverVersion = isLoading ? 'Checking...' : isError ? 'Unavailable' : health?.version;

    return (
        <Descriptions column={1} size="small" items={[
            {key: 'app', label: 'App', children: `Lynks ${APP_VERSION}`},
            {key: 'built', label: 'Built', children: formatDateTime(BUILD_TIME)},
            {
                key: 'server', label: 'Server', children: isLoading || isError
                    ? <Typography.Text type="secondary">{serverVersion}</Typography.Text>
                    : serverVersion,
            },
        ]}/>
    );
}

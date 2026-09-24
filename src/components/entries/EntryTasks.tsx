import {useState} from 'react';
import {App, Button, Collapse, Input, Select, Switch, Tag, Typography} from 'antd';
import {PlayCircleOutlined, SettingOutlined} from '@ant-design/icons';
import {useEntryTasks} from '@/hooks/useEntryTasks';
import type {TaskDefinition, TaskParameter} from '@/types';

function TaskParamInput({ param, value, onChange }: { param: TaskParameter; value: string; onChange: (v: string) => void }) {
  switch (param.type) {
    case 'bool':
      return <Switch checked={value === 'true'} onChange={(c) => onChange(c ? 'true' : 'false')} />;
    case 'enum':
      return (
        <Select
          value={value || undefined}
          onChange={onChange}
          style={{ width: '100%' }}
          placeholder={`Select ${param.description || param.name}`}
          options={param.options?.map((o) => ({ label: o, value: o })) || []}
        />
      );
    case 'multi':
      return (
        <Select
          mode="multiple"
          value={value ? value.split(',').filter(Boolean) : []}
          onChange={(v: string[]) => onChange(v.join(','))}
          style={{ width: '100%' }}
          placeholder={`Select ${param.description || param.name}`}
          options={param.options?.map((o) => ({ label: o, value: o })) || []}
        />
      );
    case 'number':
      return <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={param.description} />;
    case 'static':
        return <Tag className="lynks-chip" style={{fontSize: 'var(--font-size-sm)', padding: '2px 10px'}}>{param.value}</Tag>;
    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={param.description || param.name} />;
  }
}

export default function EntryTasks({ entryId, tasks }: { entryId: string; tasks: TaskDefinition[] }) {
  const { message } = App.useApp();
  const { runTask, runningTaskId } = useEntryTasks(entryId);
  const [paramValues, setParamValues] = useState<Record<string, Record<string, string>>>({});

  if (!tasks.length) return null;

  const handleRun = (task: TaskDefinition, e: React.MouseEvent) => {
    e.stopPropagation();
    const params = { ...(paramValues[task.id] || {}) };
    for (const p of task.params) {
      if (p.type === 'static' && p.value) params[p.name] = p.value;
    }
    runTask({ taskId: task.id, params }, {
      onSuccess: () => message.success(`Task "${task.description}" started`),
    });
  };

  const updateParam = (taskId: string, paramName: string, value: string) => {
    setParamValues((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], [paramName]: value },
    }));
  };

  const items = tasks.map((task) => {
    const editableParams = task.params.filter((p) => p.type !== 'static');
    const staticParams = task.params.filter((p) => p.type === 'static');
    const hasInputs = editableParams.length > 0 || staticParams.length > 0;

    const missingRequired = editableParams
      .filter((p) => p.required && p.type !== 'static')
      .filter((p) => !paramValues[task.id]?.[p.name]?.trim());
    const isValid = missingRequired.length === 0;

    return {
      key: task.id,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
          <div>
            <Typography.Text strong style={{ fontSize: 14 }}>{task.description}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)', display: 'block', marginTop: 1 }}>
              {task.className.split('.').pop()}
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={runningTaskId === task.id}
            onClick={(e) => handleRun(task, e)}
            disabled={!isValid}
            size="small"
            style={{ borderRadius: 'var(--radius-pill)', flexShrink: 0 }}
            title={!isValid ? `Required: ${missingRequired.map((p) => p.description || p.name).join(', ')}` : undefined}
          >
            Run
          </Button>
        </div>
      ),
      children: hasInputs ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {staticParams.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {staticParams.map((param) => (
                <div key={param.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>{param.description || param.name}:</Typography.Text>
                    <Tag className="lynks-chip" style={{margin: 0, fontSize: 'var(--font-size-xs)'}}>{param.value}</Tag>
                </div>
              ))}
            </div>
          )}
          {editableParams.map((param) => {
            const isMissing = param.required && param.type !== 'static' && !paramValues[task.id]?.[param.name]?.trim();
            return (
              <div key={param.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <SettingOutlined style={{ fontSize: 'var(--font-size-xxs)', color: 'var(--text-muted)' }} />
                  <Typography.Text style={{ fontSize: 'var(--font-size-sm)' }}>
                    {param.description || param.name}
                      {param.required && <span style={{color: 'var(--color-danger)'}}> *</span>}
                  </Typography.Text>
                  {isMissing && (
                    <Typography.Text type="danger" style={{ fontSize: 'var(--font-size-xs)' }}>Required</Typography.Text>
                  )}
                </div>
                  <div style={{outline: isMissing ? '1px solid var(--color-danger)' : undefined, borderRadius: 6}}>
                  <TaskParamInput
                    param={param}
                    value={paramValues[task.id]?.[param.name] || param.value || ''}
                    onChange={(v) => updateParam(task.id, param.name, v)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>No configurable parameters.</Typography.Text>
      ),
    };
  });

  return <Collapse items={items} />;
}

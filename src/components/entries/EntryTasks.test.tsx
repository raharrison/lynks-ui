import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {mutationsSettled} from '@/test/mutations';
import type {TaskDefinition} from '@/types';
import EntryTasks from './EntryTasks';

describe('EntryTasks', () => {
    const tasks: TaskDefinition[] = [
        {
            id: 'refetch',
            description: 'Refetch page',
            className: 'lynks.task.RefetchTask',
            params: [
                {name: 'mode', type: 'static', value: 'full', required: false, description: 'Mode'},
                {name: 'depth', type: 'number', required: true, description: 'Depth'},
                {name: 'force', type: 'bool', required: false},
            ],
        },
        {id: 'noop', description: 'Simple task', className: 'lynks.task.Noop', params: []},
    ];

    it('renders nothing without tasks', () => {
        const {container} = renderWithProviders(<EntryTasks entryId="l1" tasks={[]}/>);
        expect(container.querySelector('.ant-collapse')).toBeNull();
    });

    it('blocks a run until required params are filled, then sends them with static values', async () => {
        let body: unknown;
        server.use(http.post('/api/entry/l1/task/refetch', async ({request}) => {
            body = await request.json();
            return new HttpResponse(null, {status: 204});
        }));
        renderWithProviders(<EntryTasks entryId="l1" tasks={tasks}/>);

        expect(screen.getByText('RefetchTask')).toBeInTheDocument();
        const run = screen.getAllByRole('button', {name: 'play-circle Run'})[0];
        expect(run).toBeDisabled();
        expect(run).toHaveAttribute('title', 'Required: Depth');

        await userEvent.click(screen.getByText('Refetch page'));
        await userEvent.type(await screen.findByPlaceholderText('Depth'), '3');
        await userEvent.click(screen.getByRole('switch'));
        await userEvent.click(run);

        expect(await screen.findByText('Task "Refetch page" started')).toBeInTheDocument();
        expect(body).toEqual({depth: '3', force: 'true', mode: 'full'});
    });

    it('reports a failed run once and settles straight away', async () => {
        server.use(http.post('/api/entry/l1/task/noop', () => HttpResponse.json({message: 'Busy'}, {status: 409})));
        const {queryClient} = renderWithProviders(<EntryTasks entryId="l1" tasks={tasks}/>);

        await userEvent.click(screen.getAllByRole('button', {name: 'play-circle Run'})[1]);

        expect(await screen.findByText('Busy')).toBeInTheDocument();
        await mutationsSettled(queryClient);
        expect(screen.getAllByText('Busy')).toHaveLength(1);
    });
});

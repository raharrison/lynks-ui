import {describe, expect, it} from 'vitest';
import {screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import EntryHistory from './EntryHistory';

describe('EntryHistory', () => {
    function serve(versions: number[], audit: { auditId: string; details: string; src: string | null }[] = []) {
        server.use(
            http.get('/api/entry/l1/history', () => HttpResponse.json(
                versions.map((version) => ({id: 'l1', version, dateUpdated: '2026-01-10T10:00:00Z'})))),
            http.get('/api/entry/l1/audit', () => HttpResponse.json(
                audit.map((a) => ({...a, entryId: 'l1', timestamp: '2026-01-10T10:00:00Z'})))),
        );
    }

    it('marks the latest and the one being viewed', async () => {
        serve([3, 2, 1]);
        renderWithProviders(<EntryHistory entryId="l1" entryType="link" currentVersion={2}/>);

        const v3 = (await screen.findByText('v3')).parentElement!;
        expect(within(v3).getByText('Latest')).toBeInTheDocument();
        expect(within(screen.getByText('v2').parentElement!).getByText('Viewing')).toBeInTheDocument();
    });

    it('opens an old version by query and the latest without one', async () => {
        serve([3, 2, 1]);
        const {location} = renderWithProviders(<EntryHistory entryId="l1" entryType="link" currentVersion={3}/>);

        await userEvent.click(await screen.findByText('v1'));
        expect(location()).toMatchObject({pathname: '/links/l1', search: '?version=1'});

        await userEvent.click(screen.getByText('v3'));
        expect(location()).toMatchObject({pathname: '/links/l1', search: ''});
    });

    it('lists the audit log', async () => {
        serve([], [{auditId: 'a1', details: 'Title changed', src: 'scraper'}]);
        renderWithProviders(<EntryHistory entryId="l1" entryType="link" currentVersion={1}/>);

        expect(await screen.findByText('Title changed')).toBeInTheDocument();
        expect(screen.getByText('scraper')).toBeInTheDocument();
        expect(screen.queryByText('Version History')).not.toBeInTheDocument();
    });

    it('says when there is no history', async () => {
        serve([]);
        renderWithProviders(<EntryHistory entryId="l1" entryType="link" currentVersion={1}/>);
        expect(await screen.findByText('No history available')).toBeInTheDocument();
    });
});

import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {userSession} from '@/test/fixtures';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
    it('opens the tab named in the url and records tab changes', async () => {
        server.use(
            http.get('/api/tag', () => HttpResponse.json([])),
            http.get('/api/collection', () => HttpResponse.json([])),
        );
        const {location} = renderWithProviders(<SettingsPage/>, {route: '/settings?tab=tags'});

        expect(await screen.findByText('Manage Tags')).toBeInTheDocument();
        expect(document.title).toBe('Settings - Tags - Lynks');

        await userEvent.click(screen.getByRole('tab', {name: 'Collections'}));
        expect(location().search).toBe('?tab=collections');
        expect(await screen.findByText('Manage Collections')).toBeInTheDocument();
    });

    it('shows the security cards', async () => {
        server.use(
            http.get('/api/user/2fa', () => HttpResponse.json({enabled: false})),
            http.get('/api/user/sessions', () => HttpResponse.json([userSession({current: true})])),
        );
        renderWithProviders(<SettingsPage/>, {route: '/settings?tab=security'});

        expect(await screen.findByText('Two-Factor Authentication')).toBeInTheDocument();
        expect(await screen.findByText('Active Sessions')).toBeInTheDocument();
    });
});

import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import TwoFactorSettings from './TwoFactorSettings';

describe('TwoFactorSettings', () => {
    it('enables 2FA, then shows the secret and verifies a code', async () => {
        let enabled = false;
        let validated = '';
        server.use(
            http.get('/api/user/2fa', () => HttpResponse.json({enabled})),
            http.put('/api/user/2fa', async ({request}) => {
                enabled = (await request.json() as { enabled: boolean }).enabled;
                return new HttpResponse(null, {status: 204});
            }),
            http.get('/api/user/2fa/secret', () => HttpResponse.json({secret: 'JBSWY3DPEHPK3PXP'})),
            http.post('/api/user/2fa/validate', async ({request}) => {
                validated = (await request.json() as { code: string }).code;
                return HttpResponse.json({valid: validated === '123456'});
            }),
        );
        renderWithProviders(<TwoFactorSettings/>);

        expect(await screen.findByText('Two-factor authentication is disabled')).toBeInTheDocument();
        expect(screen.queryByText('JBSWY3DPEHPK3PXP')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: /Enable 2FA/}));
        await userEvent.click(await screen.findByRole('button', {name: 'Enable'}));

        expect(await screen.findByText('2FA enabled')).toBeInTheDocument();
        expect(await screen.findByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument();

        await userEvent.type(screen.getByPlaceholderText('Enter code'), '000000');
        await userEvent.click(screen.getByRole('button', {name: 'Verify'}));
        expect(await screen.findByText('Invalid code')).toBeInTheDocument();

        await userEvent.clear(screen.getByPlaceholderText('Enter code'));
        await userEvent.type(screen.getByPlaceholderText('Enter code'), '123456');
        await userEvent.click(screen.getByRole('button', {name: 'Verify'}));
        expect(await screen.findByText('Code is valid')).toBeInTheDocument();
    });

    it('disables 2FA', async () => {
        let body: unknown;
        server.use(
            http.get('/api/user/2fa', () => HttpResponse.json({enabled: true})),
            http.get('/api/user/2fa/secret', () => HttpResponse.json({secret: 'S'})),
            http.put('/api/user/2fa', async ({request}) => {
                body = await request.json();
                return new HttpResponse(null, {status: 204});
            }),
        );
        renderWithProviders(<TwoFactorSettings/>);

        await userEvent.click(await screen.findByRole('button', {name: /Disable 2FA/}));
        await userEvent.click(await screen.findByRole('button', {name: 'Disable'}));

        expect(await screen.findByText('2FA disabled')).toBeInTheDocument();
        expect(body).toEqual({enabled: false});
    });
});

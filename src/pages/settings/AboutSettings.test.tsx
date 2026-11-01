import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {APP_VERSION} from '@/lib/version';
import AboutSettings from './AboutSettings';

describe('AboutSettings', () => {
    it('shows the app version beside the server version', async () => {
        server.use(http.get('/api/health', () =>
            HttpResponse.json({status: 'up', application: 'lynks', version: '9.8.7'})));
        renderWithProviders(<AboutSettings/>);

        expect(screen.getByText(`Lynks ${APP_VERSION}`)).toBeInTheDocument();
        expect(await screen.findByText('9.8.7')).toBeInTheDocument();
    });

    it('says so when the server cannot be asked', async () => {
        server.use(http.get('/api/health', () => new HttpResponse(null, {status: 503})));
        renderWithProviders(<AboutSettings/>);

        expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    });
});

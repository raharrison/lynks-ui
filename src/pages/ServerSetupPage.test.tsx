import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import ServerSetupPage from './ServerSetupPage';

// what @capacitor/preferences writes in a browser
const STORED_SERVER = 'CapacitorStorage.lynks.serverUrl';

describe('ServerSetupPage', () => {
    it('stores a server that answers as Lynks', async () => {
        server.use(http.get('https://lynks.test/api/health', () =>
            HttpResponse.json({status: 'up', application: 'lynks', version: '2.1.0'})));
        const user = userEvent.setup();
        renderWithProviders(<ServerSetupPage/>);

        await user.type(screen.getByLabelText('Server address'), 'lynks.test');
        await user.click(screen.getByRole('button', {name: 'Connect'}));

        await waitFor(() => expect(localStorage.getItem(STORED_SERVER)).toBe('https://lynks.test'));
    });

    it('names a server that is not Lynks', async () => {
        server.use(http.get('https://other.test/api/health', () => new HttpResponse(null, {status: 404})));
        const user = userEvent.setup();
        renderWithProviders(<ServerSetupPage/>);

        await user.type(screen.getByLabelText('Server address'), 'other.test');
        await user.click(screen.getByRole('button', {name: 'Connect'}));

        expect(await screen.findByText('https://other.test answered, but it is not a Lynks server.')).toBeInTheDocument();
        expect(localStorage.getItem(STORED_SERVER)).toBeNull();
    });

    it('warns about plain http as it is typed', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ServerSetupPage/>);

        await user.type(screen.getByLabelText('Server address'), 'http://192.168.1.5:8080');

        expect(screen.getByText(/crosses the network in the clear/)).toBeInTheDocument();
    });
});

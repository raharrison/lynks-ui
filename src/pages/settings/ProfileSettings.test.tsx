import {beforeEach, describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {user} from '@/test/fixtures';
import ProfileSettings from './ProfileSettings';

beforeEach(() => {
    server.use(http.get('/api/user', () => HttpResponse.json(user({displayName: 'Ryan', digest: true}))));
});

describe('ProfileSettings', () => {
    it('saves the display name and digest preference', async () => {
        let body: unknown;
        server.use(http.put('/api/user', async ({request}) => {
            body = await request.json();
            return HttpResponse.json(user());
        }));
        renderWithProviders(<ProfileSettings/>);

        expect(await screen.findByText('ryan')).toBeInTheDocument();
        const name = screen.getByPlaceholderText('Your display name');
        expect(name).toHaveValue('Ryan');
        await userEvent.clear(name);
        await userEvent.type(name, 'R');
        await userEvent.click(screen.getByRole('switch'));
        await userEvent.click(screen.getByRole('button', {name: /Save Profile/}));

        expect(await screen.findByText('Profile updated')).toBeInTheDocument();
        expect(body).toEqual({displayName: 'R', digest: false});
    });

    it('shows an error when the profile cannot load', async () => {
        server.use(http.get('/api/user', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<ProfileSettings/>);
        expect(await screen.findByText('Failed to load profile')).toBeInTheDocument();
    });
});

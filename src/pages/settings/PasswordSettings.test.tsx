import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {mutationsSettled} from '@/test/mutations';
import PasswordSettings from './PasswordSettings';

describe('PasswordSettings', () => {
    async function fill(oldPw: string, newPw: string, confirm: string) {
        const inputs = document.querySelectorAll<HTMLInputElement>('input[type=password]');
        await userEvent.type(inputs[0], oldPw);
        await userEvent.type(inputs[1], newPw);
        await userEvent.type(inputs[2], confirm);
        await userEvent.click(screen.getByRole('button', {name: 'Change Password'}));
    }

    it('checks the length and that both entries match', async () => {
        renderWithProviders(<PasswordSettings/>);

        await fill('old', 'short', 'other');

        expect(await screen.findByText('Minimum 8 characters')).toBeInTheDocument();
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('sends only the old and new password and clears the form', async () => {
        let body: unknown;
        server.use(http.post('/api/user/changePassword', async ({request}) => {
            body = await request.json();
            return new HttpResponse(null, {status: 204});
        }));
        renderWithProviders(<PasswordSettings/>);

        await fill('old-password', 'new-password', 'new-password');

        expect(await screen.findByText('Password changed successfully')).toBeInTheDocument();
        expect(body).toEqual({oldPassword: 'old-password', newPassword: 'new-password'});
        document.querySelectorAll<HTMLInputElement>('input[type=password]').forEach((i) => expect(i).toHaveValue(''));
    });

    it('explains a rejected current password', async () => {
        server.use(http.post('/api/user/changePassword', () => new HttpResponse(null, {status: 403})));
        const {queryClient} = renderWithProviders(<PasswordSettings/>);

        await fill('wrong-password', 'new-password', 'new-password');

        expect(await screen.findByText('Failed to change password. Check your current password.')).toBeInTheDocument();
        await mutationsSettled(queryClient);
        expect(screen.getByRole('button', {name: 'Change Password'})).not.toHaveClass('ant-btn-loading');
    });
});

import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {digest, slimLink} from '@/test/fixtures';
import DigestPage from './DigestPage';

describe('DigestPage', () => {
    it('lists the digest links and counts the unread ones', async () => {
        server.use(http.get('/api/digest', () => HttpResponse.json(digest({
            links: [
                slimLink({id: 'a', title: 'Unread one', read: false}),
                slimLink({id: 'b', title: 'Read one', read: true}),
            ]
        }))));
        renderWithProviders(<DigestPage/>);

        expect(await screen.findByText('Unread one')).toBeInTheDocument();
        expect(screen.getByText('Read one')).toBeInTheDocument();
        expect(screen.getByText('(2)')).toBeInTheDocument();
        expect(screen.getByText('1 unread')).toBeInTheDocument();
    });

    it('treats a missing digest as not generated yet', async () => {
        server.use(http.get('/api/digest', () => new HttpResponse(null, {status: 404})));
        renderWithProviders(<DigestPage/>);

        expect(await screen.findByText(/No digest yet/)).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /Browse links/})).toHaveAttribute('href', '/links');
    });

    it('explains a digest whose links were all deleted', async () => {
        server.use(http.get('/api/digest', () => HttpResponse.json(digest({links: []}))));
        renderWithProviders(<DigestPage/>);
        expect(await screen.findByText('Every link in this digest has since been deleted.')).toBeInTheDocument();
    });

    it('shows other failures as errors', async () => {
        server.use(http.get('/api/digest', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<DigestPage/>);
        expect(await screen.findByText('Failed to load digest')).toBeInTheDocument();
    });

    it('stars a digest link in place', async () => {
        server.use(
            http.get('/api/digest', () => HttpResponse.json(digest({links: [slimLink({id: 'a'})]}))),
            http.post('/api/entry/a/star', () => HttpResponse.json({})),
        );
        renderWithProviders(<DigestPage/>);

        await userEvent.click(await screen.findByRole('button', {name: 'Star entry'}));

        expect(await screen.findByRole('button', {name: 'Unstar entry'})).toBeInTheDocument();
    });
});

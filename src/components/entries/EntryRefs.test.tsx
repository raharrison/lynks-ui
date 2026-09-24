import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import EntryRefs from './EntryRefs';

describe('EntryRefs', () => {
    it('links both directions, falling back to the id when untitled', async () => {
        server.use(http.get('/api/entry/n1/refs', () => HttpResponse.json({
            outbound: [{entryId: 'l1', entryType: 'link', title: 'Target'}],
            inbound: [{entryId: 's1', entryType: 'snippet', title: null}],
        })));
        renderWithProviders(<EntryRefs entryId="n1"/>);

        expect(await screen.findByText('Links to (1)')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /Target/})).toHaveAttribute('href', '/links/l1');
        expect(screen.getByText('Linked from (1)')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /s1/})).toHaveAttribute('href', '/snippets/s1');
    });
});

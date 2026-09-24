import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderWithProviders} from '@/test/render';
import {collection, slimLink, slimNote, slimSnippet, tag} from '@/test/fixtures';
import EntryCard from './EntryCard';

describe('EntryCard', () => {
    it('links to the typed detail page', () => {
        renderWithProviders(<EntryCard entry={slimNote({id: 'n1', title: 'My note'})} onStar={vi.fn()}/>);
        expect(screen.getByRole('link', {name: /My note/})).toHaveAttribute('href', '/notes/n1');
    });

    it('shows a link source and unread state', () => {
        renderWithProviders(<EntryCard entry={slimLink({source: 'news.ycombinator.com', read: false})} onStar={vi.fn()}/>);
        expect(screen.getByText('news.ycombinator.com')).toBeInTheDocument();
        expect(screen.getByText('Unread')).toBeInTheDocument();
    });

    it('does not mark a read link unread', () => {
        renderWithProviders(<EntryCard entry={slimLink({read: true})} onStar={vi.fn()}/>);
        expect(screen.queryByText('Unread')).not.toBeInTheDocument();
    });

    it('titles a snippet from its content with the markup stripped', () => {
        const long = 'x'.repeat(100);
        renderWithProviders(<EntryCard entry={slimSnippet({renderedContent: `<pre><code>${long}</code></pre>`})}
                                       onStar={vi.fn()}/>);
        expect(screen.getByText(`${'x'.repeat(80)}...`)).toBeInTheDocument();
    });

    it('stars without following the link', async () => {
        const onStar = vi.fn();
        const {location} = renderWithProviders(<EntryCard entry={slimLink({id: 'l1', starred: false})} onStar={onStar}/>);

        await userEvent.click(screen.getByRole('button', {name: 'Star entry'}));

        expect(onStar).toHaveBeenCalledWith('l1', false);
        expect(location().pathname).toBe('/');
    });

    it('offers to unstar a starred entry', async () => {
        const onStar = vi.fn();
        renderWithProviders(<EntryCard entry={slimLink({id: 'l1', starred: true})} onStar={onStar}/>);

        await userEvent.click(screen.getByRole('button', {name: 'Unstar entry'}));

        expect(onStar).toHaveBeenCalledWith('l1', true);
    });

    it('shows the thumbnail and hides it if it fails to load', () => {
        renderWithProviders(<EntryCard entry={slimLink({id: 'l1', title: 'Pic', thumbnailId: 't1'})} onStar={vi.fn()}/>);
        const img = screen.getByRole('img', {name: 'Pic'});
        expect(img).toHaveAttribute('src', '/api/entry/l1/resource/t1');

        fireEvent.error(img);

        expect(screen.queryByRole('img', {name: 'Pic'})).not.toBeInTheDocument();
    });

    it('lists tags and collections', () => {
        renderWithProviders(
            <EntryCard entry={slimNote({tags: [tag({name: 'rust'})], collections: [collection({name: 'Reading'})]})}
                       onStar={vi.fn()}/>,
        );
        expect(screen.getByText('rust')).toBeInTheDocument();
        expect(screen.getByText('Reading')).toBeInTheDocument();
    });
});

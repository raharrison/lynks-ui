import {describe, expect, it} from 'vitest';
import {screen, within} from '@testing-library/react';
import {renderWithProviders} from '@/test/render';
import {discussion} from '@/test/fixtures';
import EntryDiscussions from './EntryDiscussions';

describe('EntryDiscussions', () => {
    it('says when there are none', () => {
        renderWithProviders(<EntryDiscussions discussions={[]}/>);
        expect(screen.getByText('No discussions found yet')).toBeInTheDocument();
    });

    it('labels known sources and resolves their urls', () => {
        renderWithProviders(<EntryDiscussions discussions={[
            discussion({source: 'hacker_news', title: 'On HN', url: 'news.ycombinator.com/item?id=1'}),
            discussion({source: 'reddit', title: 'On Reddit', url: '/r/rust/comments/abc'}),
            discussion({source: 'lobste_rs', title: 'Elsewhere', url: 'https://lobste.rs/s/x', score: 9, comments: 2}),
        ]}/>);

        expect(screen.getByRole('link', {name: /On HN/})).toHaveAttribute('href', 'https://news.ycombinator.com/item?id=1');
        expect(screen.getByRole('link', {name: /On Reddit/})).toHaveAttribute('href', 'https://old.reddit.com/r/rust/comments/abc');
        const other = screen.getByRole('link', {name: /Elsewhere/});
        expect(other).toHaveAttribute('target', '_blank');
        expect(within(other).getByText('Lobste rs')).toBeInTheDocument();
        expect(within(other).getByText('9 points')).toBeInTheDocument();
        expect(screen.getByText('Hacker News')).toBeInTheDocument();
        expect(screen.getByText('Reddit')).toBeInTheDocument();
    });
});

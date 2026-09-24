import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderWithProviders} from '@/test/render';
import MarkdownContent from './MarkdownContent';

function renderHtml(html: string) {
    return renderWithProviders(<MarkdownContent html={html}/>);
}

describe('MarkdownContent', () => {
    it('shows the empty message when there is nothing to render', () => {
        renderWithProviders(<MarkdownContent emptyMessage="Nothing here"/>);
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renders plain text verbatim when there is no html', () => {
        const {container} = renderWithProviders(<MarkdownContent plain={'<b>not bold</b>\nline two'}/>);
        expect(container.querySelector('b')).toBeNull();
        expect(screen.getByText(/<b>not bold<\/b>/)).toBeInTheDocument();
    });

    it('renders server html', () => {
        renderHtml('<h2>Heading</h2><p>Some <strong>bold</strong> text</p>');
        expect(screen.getByRole('heading', {name: 'Heading'})).toBeInTheDocument();
        expect(screen.getByText('bold').tagName).toBe('STRONG');
    });

    describe('sanitising', () => {
        it('drops script tags', () => {
            const {container} = renderHtml('<p>ok</p><script>window.pwned = true</script>');
            expect(container.querySelector('script')).toBeNull();
        });

        it('drops event handler attributes', () => {
            const {container} = renderHtml('<img src="x.png" onerror="alert(1)"><p onclick="alert(2)">hi</p>');
            expect(container.querySelector('[onerror]')).toBeNull();
            expect(container.querySelector('[onclick]')).toBeNull();
        });

        it('drops javascript urls', () => {
            renderHtml('<a href="javascript:alert(1)">click</a>');
            expect(screen.getByText('click').closest('a')?.getAttribute('href') ?? '').not.toMatch(/javascript/i);
        });

        it('drops iframes and inline styles', () => {
            const {container} = renderHtml('<iframe src="https://evil.test"></iframe><p style="position:fixed">x</p>');
            expect(container.querySelector('iframe')).toBeNull();
            expect(container.querySelector('[style*="fixed"]')).toBeNull();
        });

        it('keeps flexmark task list checkboxes', () => {
            renderHtml('<ul><li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" checked readonly> done</li></ul>');
            const box = screen.getByRole('checkbox');
            expect(box).toBeChecked();
            expect(box).toHaveClass('task-list-item-checkbox');
        });
    });

    describe('links', () => {
        it('opens external links in a new tab without an opener', () => {
            renderHtml('<a href="https://example.com/page">external</a>');
            const a = screen.getByRole('link', {name: 'external'});
            expect(a).toHaveAttribute('href', 'https://example.com/page');
            expect(a).toHaveAttribute('target', '_blank');
            expect(a).toHaveAttribute('rel', 'noopener noreferrer');
        });

        it('routes same origin links in the app', async () => {
            const {location} = renderHtml(`<a href="${window.location.origin}/notes/n1?version=2#top">internal</a>`);
            const a = screen.getByRole('link', {name: 'internal'});
            expect(a).not.toHaveAttribute('target');

            await userEvent.click(a);

            expect(location()).toMatchObject({pathname: '/notes/n1', search: '?version=2', hash: '#top'});
        });

        it('routes relative links in the app', async () => {
            const {location} = renderHtml('<a href="/links/l1">relative</a>');
            await userEvent.click(screen.getByRole('link', {name: 'relative'}));
            expect(location().pathname).toBe('/links/l1');
        });
    });
});

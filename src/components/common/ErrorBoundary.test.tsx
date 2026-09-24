import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

let shouldThrow = true;

function Flaky() {
    if (shouldThrow) throw new Error('Kaboom');
    return <p>Recovered</p>;
}

describe('ErrorBoundary', () => {
    it('shows the error and recovers on retry', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {
        });
        shouldThrow = true;
        render(<ErrorBoundary><Flaky/></ErrorBoundary>);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Kaboom')).toBeInTheDocument();

        shouldThrow = false;
        await userEvent.click(screen.getByRole('button', {name: 'Try Again'}));

        expect(screen.getByText('Recovered')).toBeInTheDocument();
    });

    it('renders children when nothing throws', () => {
        render(<ErrorBoundary><p>Fine</p></ErrorBoundary>);
        expect(screen.getByText('Fine')).toBeInTheDocument();
    });
});

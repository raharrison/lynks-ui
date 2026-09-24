import '@testing-library/jest-dom/vitest';
import {afterAll, afterEach, beforeAll, vi} from 'vitest';
import {cleanup} from '@testing-library/react';
import {server} from './server';

// jsdom has neither, and themeStore reads matchMedia at import time
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// jsdom has no layout; ProseMirror measures ranges and hit-tests clicks
document.elementFromPoint ??= () => null;
Range.prototype.getClientRects ??= () => ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: [][Symbol.iterator]
}) as unknown as DOMRectList;
Range.prototype.getBoundingClientRect ??= () => new DOMRect();

// Ant Design asks for scrollbar pseudo-element styles, which jsdom logs as unimplemented
const getComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element) => getComputedStyle(element);

window.ResizeObserver ??= class {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
};

beforeAll(() => server.listen({onUnhandledRequest: 'error'}));

afterEach(() => {
    cleanup();
    server.resetHandlers();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
});

afterAll(() => server.close());

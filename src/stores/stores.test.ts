import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useThemeStore} from './themeStore';
import {useSidebarStore} from './sidebarStore';
import {useAuthStore} from './authStore';
import {user} from '@/test/fixtures';

function prefersDark(dark: boolean) {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        matches: dark && query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

describe('themeStore', () => {
    beforeEach(() => {
        prefersDark(false);
        useThemeStore.setState({mode: 'system', resolved: 'light'});
    });

    it('resolves explicit modes as themselves', () => {
        prefersDark(true);
        useThemeStore.getState().setMode('light');
        expect(useThemeStore.getState().resolved).toBe('light');

        useThemeStore.getState().setMode('dark');
        expect(useThemeStore.getState().resolved).toBe('dark');
    });

    it('resolves system mode from the OS preference', () => {
        prefersDark(true);
        useThemeStore.getState().setMode('system');
        expect(useThemeStore.getState().resolved).toBe('dark');

        prefersDark(false);
        useThemeStore.getState().setMode('system');
        expect(useThemeStore.getState().resolved).toBe('light');
    });

    it('persists only the mode, since resolved depends on the device', () => {
        useThemeStore.getState().setMode('dark');
        expect(JSON.parse(localStorage.getItem('lynks-theme')!).state).toEqual({mode: 'dark'});
    });

    it('re-resolves a persisted system mode on rehydrate', async () => {
        localStorage.setItem('lynks-theme', JSON.stringify({state: {mode: 'system'}, version: 0}));
        prefersDark(true);

        await useThemeStore.persist.rehydrate();

        expect(useThemeStore.getState()).toMatchObject({mode: 'system', resolved: 'dark'});
    });
});

describe('sidebarStore', () => {
    beforeEach(() => {
        useSidebarStore.setState({collapsed: false});
    });

    it('toggles and persists', () => {
        useSidebarStore.getState().toggle();
        expect(useSidebarStore.getState().collapsed).toBe(true);
        expect(JSON.parse(localStorage.getItem('sidebar')!).state.collapsed).toBe(true);

        useSidebarStore.getState().toggle();
        expect(useSidebarStore.getState().collapsed).toBe(false);
    });

    it('sets collapsed directly', () => {
        useSidebarStore.getState().setCollapsed(true);
        expect(useSidebarStore.getState().collapsed).toBe(true);
    });
});

describe('authStore', () => {
    it('sets and clears the user', () => {
        useAuthStore.getState().setUser(user());
        expect(useAuthStore.getState().user).toEqual(user());

        useAuthStore.getState().clear();
        expect(useAuthStore.getState().user).toBeNull();
    });
});

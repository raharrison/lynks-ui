import {describe, expect, it} from 'vitest';
import {act} from '@testing-library/react';
import {renderHookWithProviders} from '@/test/render';
import {useGroupFilter, useGroupFilters} from './useGroupFilter';

describe('useGroupFilter', () => {
    it('adds a filter on the current list page and resets paging', () => {
        const {result, location} = renderHookWithProviders(() => useGroupFilter('tags', 't2'), {route: '/links?tags=t1&page=3'});
        expect(result.current.isActive).toBe(false);

        act(() => result.current.toggle());

        expect(location().pathname).toBe('/links');
        expect(location().search).toBe('?tags=t1%2Ct2');
    });

    it('removes an active filter', () => {
        const {
            result,
            location
        } = renderHookWithProviders(() => useGroupFilter('collections', 'c1'), {route: '/?collections=c1'});
        expect(result.current.isActive).toBe(true);

        act(() => result.current.toggle());

        expect(location().search).toBe('');
    });

    it('goes to the main list from a detail page, dropping its own params', () => {
        const {
            result,
            location
        } = renderHookWithProviders(() => useGroupFilter('tags', 't1'), {route: '/links/abc?tab=history&version=2'});
        expect(result.current.isActive).toBe(false);

        act(() => result.current.toggle());

        expect(location().pathname).toBe('/');
        expect(location().search).toBe('?tags=t1');
    });

    it('exposes selections only on list pages', () => {
        const onList = renderHookWithProviders(() => useGroupFilters(), {route: '/notes?tags=a&collections=b'});
        expect(onList.result.current).toMatchObject({selectedTags: ['a'], selectedCollections: ['b']});

        const offList = renderHookWithProviders(() => useGroupFilters(), {route: '/settings?tags=a'});
        expect(offList.result.current).toMatchObject({selectedTags: [], selectedCollections: []});
    });
});

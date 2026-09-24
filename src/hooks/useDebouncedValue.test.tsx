import {afterEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useDebouncedValue} from './useDebouncedValue';

describe('useDebouncedValue', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('only settles once the value stops changing', () => {
        vi.useFakeTimers();
        const {result, rerender} = renderHook(({value}) => useDebouncedValue(value, 300), {initialProps: {value: 'a'}});

        rerender({value: 'ab'});
        act(() => vi.advanceTimersByTime(200));
        rerender({value: 'abc'});
        act(() => vi.advanceTimersByTime(200));
        expect(result.current).toBe('a');

        act(() => vi.advanceTimersByTime(100));
        expect(result.current).toBe('abc');
    });
});

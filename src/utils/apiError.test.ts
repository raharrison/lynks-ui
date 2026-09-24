import {describe, expect, it} from 'vitest';
import {apiError} from '@/test/errors';
import {getApiErrorMessage} from './apiError';

describe('getApiErrorMessage', () => {
    it('uses the server message', () => {
        expect(getApiErrorMessage(apiError(400, {message: 'Title is required'}))).toBe('Title is required');
    });

    it('falls back when the server message is missing, empty or not a string', () => {
        expect(getApiErrorMessage(apiError(400, {}), 'Nope')).toBe('Nope');
        expect(getApiErrorMessage(apiError(400, {message: ''}), 'Nope')).toBe('Nope');
        expect(getApiErrorMessage(apiError(400, {message: 42}), 'Nope')).toBe('Nope');
        expect(getApiErrorMessage(apiError(400, undefined), 'Nope')).toBe('Nope');
    });

    it('never surfaces a plain error message', () => {
        expect(getApiErrorMessage(new Error('stack trace'))).toBe('An unexpected error occurred');
    });
});

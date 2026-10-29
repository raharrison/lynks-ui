import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useKeyboardOpen} from './useKeyboardOpen';

const FULL_HEIGHT = 800;

function setHeight(height: number) {
    Object.defineProperty(window, 'innerHeight', {configurable: true, value: height});
    act(() => {
        window.dispatchEvent(new Event('resize'));
    });
}

function addField(html: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.append(wrapper);
    return wrapper.firstElementChild as HTMLElement;
}

const keyboard = () => document.documentElement.dataset.keyboard;

describe('useKeyboardOpen', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'innerHeight', {configurable: true, value: FULL_HEIGHT});
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('marks the keyboard open while a text field is focused and the viewport shrinks', () => {
        renderHook(() => useKeyboardOpen());
        const input = addField('<input type="text">');

        act(() => input.focus());
        expect(keyboard()).toBeUndefined();

        setHeight(FULL_HEIGHT - 300);
        expect(keyboard()).toBe('open');

        setHeight(FULL_HEIGHT);
        expect(keyboard()).toBeUndefined();
    });

    it('treats a contenteditable editor as a text field', () => {
        renderHook(() => useKeyboardOpen());
        const editor = addField('<div contenteditable="true" tabindex="0"></div>');
        Object.defineProperty(editor, 'isContentEditable', {value: true});

        act(() => editor.focus());
        setHeight(FULL_HEIGHT - 300);
        expect(keyboard()).toBe('open');
    });

    it('ignores a shorter viewport with no text field focused', () => {
        renderHook(() => useKeyboardOpen());
        const checkbox = addField('<input type="checkbox">');

        act(() => checkbox.focus());
        setHeight(FULL_HEIGHT - 300);
        expect(keyboard()).toBeUndefined();
    });

    it('ignores the small resize of a collapsing url bar', () => {
        renderHook(() => useKeyboardOpen());
        const input = addField('<input type="search">');

        act(() => input.focus());
        setHeight(FULL_HEIGHT - 60);
        expect(keyboard()).toBeUndefined();
    });

    it('clears the mark once the field loses focus', async () => {
        renderHook(() => useKeyboardOpen());
        const input = addField('<textarea></textarea>');

        act(() => input.focus());
        setHeight(FULL_HEIGHT - 300);
        expect(keyboard()).toBe('open');

        await act(async () => {
            input.blur();
            await new Promise((resolve) => setTimeout(resolve));
        });
        expect(keyboard()).toBeUndefined();
    });

    it('clears the mark on unmount', () => {
        const {unmount} = renderHook(() => useKeyboardOpen());
        const input = addField('<input>');

        act(() => input.focus());
        setHeight(FULL_HEIGHT - 300);
        unmount();
        expect(keyboard()).toBeUndefined();
    });
});

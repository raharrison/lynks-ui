import {useEffect} from 'react';

const NON_TEXT_INPUTS = new Set(['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit']);

// Above the ~60px a browser's collapsing url bar takes, below any on-screen keyboard.
const KEYBOARD_MIN_HEIGHT = 150;

function isTextEntry(el: Element | null): boolean {
    if (!(el instanceof HTMLElement)) return false;
    if (el.isContentEditable) return true;
    if (el instanceof HTMLTextAreaElement) return !el.readOnly;
    if (el instanceof HTMLInputElement) return !el.readOnly && !NON_TEXT_INPUTS.has(el.type);
    return false;
}

const viewportHeight = () => window.visualViewport?.height ?? window.innerHeight;

/**
 * Marks `<html data-keyboard="open">` while an on-screen keyboard is up, so the fixed
 * bottom bars can get out of the way of what is being typed.
 *
 * A focused field alone is not enough, because Android's back dismisses the keyboard
 * and leaves the focus where it was; nor is a shorter viewport, which split screen
 * also gives. So it takes both.
 */
export function useKeyboardOpen() {
    useEffect(() => {
        const root = document.documentElement;
        let width = window.innerWidth;
        let fullHeight = viewportHeight();

        const update = () => {
            const height = viewportHeight();
            if (window.innerWidth !== width) {
                width = window.innerWidth;
                fullHeight = height;
            }
            fullHeight = Math.max(fullHeight, height);
            const open = isTextEntry(document.activeElement) && fullHeight - height > KEYBOARD_MIN_HEIGHT;
            if (open) root.dataset.keyboard = 'open';
            else delete root.dataset.keyboard;
        };

        // activeElement is still the old field during focusout.
        const updateAfterBlur = () => setTimeout(update);

        const viewport = window.visualViewport;
        viewport?.addEventListener('resize', update);
        window.addEventListener('resize', update);
        document.addEventListener('focusin', update);
        document.addEventListener('focusout', updateAfterBlur);
        return () => {
            viewport?.removeEventListener('resize', update);
            window.removeEventListener('resize', update);
            document.removeEventListener('focusin', update);
            document.removeEventListener('focusout', updateAfterBlur);
            delete root.dataset.keyboard;
        };
    }, []);
}

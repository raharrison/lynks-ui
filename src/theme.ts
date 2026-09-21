/**
 * The Lynks palette. Ant Design derives its own colour ramps from these, so it
 * needs literal values and cannot read the CSS custom properties directly -
 * `src/index.css` mirrors this by hand and the two have to move together.
 */

/** The lime from the icon. Signature colour, used as a fill in both themes. */
export const LIME = '#bef264';
export const LIME_HOVER = '#d9f99d';
export const LIME_ACTIVE = '#a3e635';

/** Lime is too light to carry white text, so solid lime surfaces use ink. */
export const LIME_INK = '#1a2e05';

export interface Palette {
    accent: string;
    accentHover: string;
    bgLayout: string;
    bgContainer: string;
    bgElevated: string;
    bgHeader: string;
    border: string;
    borderSecondary: string;
    text: string;
    textSecondary: string;
}

export const PALETTE: Record<'light' | 'dark', Palette> = {
    /* Lime itself only clears 1.6:1 on white, so light mode drops to lime-700 for
       anything that has to be read as text or a border. */
    light: {
        accent: '#4d7c0f',
        accentHover: '#3f6212',
        bgLayout: '#f4f4f5',
        bgContainer: '#ffffff',
        bgElevated: '#ffffff',
        bgHeader: '#ffffff',
        border: '#e4e4e7',
        borderSecondary: '#f4f4f5',
        text: '#18181b',
        textSecondary: '#52525b',
    },
    dark: {
        accent: LIME,
        accentHover: LIME_HOVER,
        bgLayout: '#0b0b0e',
        bgContainer: '#16161a',
        bgElevated: '#1e1e23',
        bgHeader: '#121216',
        border: '#2c2c33',
        borderSecondary: '#222228',
        text: '#e4e4e7',
        textSecondary: '#a1a1aa',
    },
};

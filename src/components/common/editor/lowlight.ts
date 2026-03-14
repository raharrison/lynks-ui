import {common, createLowlight} from 'lowlight';

export const lowlight = createLowlight(common);
export const LANGUAGE_OPTIONS = lowlight.listLanguages().sort().map((lang) => ({value: lang, label: lang}));

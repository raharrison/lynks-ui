import {defaultSchema} from 'rehype-sanitize';

/**
 * Server-rendered markdown and scraped page content can carry raw HTML, so both are filtered
 * through this before reaching the DOM. It widens the default only for flexmark's task-list checkboxes.
 */
export const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        input: [...(defaultSchema.attributes?.input ?? []), ['className', 'task-list-item-checkbox'], 'checked', 'readOnly'],
    },
};

import type { Collection, Tag } from '@/types';

type TreeNode = { id: string; name: string; children?: TreeNode[] };

/**
 * Generic recursive tree mapper. Transforms a Tag or Collection tree into
 * any output shape without duplicating the recursive walk.
 */
export function mapTree<T extends TreeNode, R>(
  items: T[],
  map: (item: T, children: R[] | undefined) => R,
): R[] {
  return items.map((item) =>
    map(item, item.children?.length ? mapTree(item.children as T[], map) : undefined)
  );
}

/**
 * Flatten a tag or collection tree into a flat select-option list,
 * showing the full path as the label (e.g. "Parent / Child").
 */
export function flattenTree<T extends TreeNode>(items: T[], prefix = ''): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  for (const item of items) {
    const label = prefix ? `${prefix} / ${item.name}` : item.name;
    result.push({ label, value: item.id });
    if (item.children?.length) result.push(...flattenTree(item.children as T[], label));
  }
  return result;
}

/** Convenience wrappers kept for call-site readability */
export const flattenTags = (tags: Tag[], prefix?: string) => flattenTree(tags, prefix);
export const flattenCollections = (collections: Collection[], prefix?: string) => flattenTree(collections, prefix);

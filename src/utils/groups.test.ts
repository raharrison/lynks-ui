import {describe, expect, it} from 'vitest';
import {flattenTree, mapTree} from './groups';
import {tag} from '@/test/fixtures';

const tree = [
    tag({
        id: 'a',
        name: 'Work',
        children: [
            tag({id: 'b', name: 'Projects', children: [tag({id: 'c', name: 'Lynks'})]}),
            tag({id: 'd', name: 'Meetings'}),
        ],
    }),
    tag({id: 'e', name: 'Home'}),
];

describe('flattenTree', () => {
    it('lists every node depth first with its full path as the label', () => {
        expect(flattenTree(tree)).toEqual([
            {label: 'Work', value: 'a'},
            {label: 'Work / Projects', value: 'b'},
            {label: 'Work / Projects / Lynks', value: 'c'},
            {label: 'Work / Meetings', value: 'd'},
            {label: 'Home', value: 'e'},
        ]);
    });

    it('applies a prefix', () => {
        expect(flattenTree([tag({id: 'x', name: 'Leaf'})], 'Root')).toEqual([{label: 'Root / Leaf', value: 'x'}]);
    });

    it('handles an empty tree', () => {
        expect(flattenTree([])).toEqual([]);
    });
});

describe('mapTree', () => {
    it('maps recursively and passes undefined for leaves', () => {
        type Node = { key: string; kids?: Node[] };
        const mapped = mapTree<typeof tree[number], Node>(tree, (item, children) => ({key: item.id, kids: children}));
        expect(mapped).toEqual([
            {
                key: 'a',
                kids: [
                    {key: 'b', kids: [{key: 'c', kids: undefined}]},
                    {key: 'd', kids: undefined},
                ],
            },
            {key: 'e', kids: undefined},
        ]);
    });
});

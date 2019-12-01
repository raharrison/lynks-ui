export interface Grouping<T> {
    id: string,
    name: string,
    children: T[],
    dateCreated: bigint,
    dateUpdated: bigint
}

export interface Tag extends Grouping<Tag> {}

export interface Collection extends Grouping<Collection> {}

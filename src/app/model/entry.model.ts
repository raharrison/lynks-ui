import {Collection, Tag} from "./group.model";

export interface BaseProperties {
    attributes: { string: any },
    tasks: { id: string, description: string }[]
}

export interface Entry {
    id: string,
    title: string
    dateUpdated: bigint,
    version: number,
    starred: boolean,
    props: BaseProperties
    tags: Tag[],
    collections: Collection[],
    type: string
}

export interface NewEntry {
    id: string,
    tags: string[],
    collection: string[]
}


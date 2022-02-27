export interface Grouping<T> {
  id: string,
  path: string,
  name: string,
  children: T[],
  dateCreated: number,
  dateUpdated: number
}

export interface Tag extends Grouping<Tag> {
}

export interface Collection extends Grouping<Collection> {
}

export interface NewTag {
  id?: string
  name: string
}

export interface NewCollection {
  id?: string
  name: string
  parentId: string
}

export enum GroupType {
  TAG = "tag",
  COLLECTION = "collection"
}

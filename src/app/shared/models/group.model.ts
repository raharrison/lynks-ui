export interface Grouping<T> {
  id: string,
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
  id: string
  name: string
}

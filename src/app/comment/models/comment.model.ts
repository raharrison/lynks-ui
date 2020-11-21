export interface Comment {
  id: string,
  entryId: string,
  plainText: string,
  markdownText: string,
  dateCreated: number,
  dateUpdated: number
}

export interface NewComment {
  id: string,
  plainText: string
}

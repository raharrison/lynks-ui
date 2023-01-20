export enum SortDirection {
  ASC = "asc", DESC = "desc", RAND = "rand"
}

export interface SortConfig {
  name: string,
  sort: string,
  direction: SortDirection
}

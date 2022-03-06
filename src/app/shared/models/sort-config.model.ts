export enum SortDirection {
  ASC = "asc", DESC = "desc"
}

export interface SortConfig {
  name: string,
  sort: string,
  direction: SortDirection
}

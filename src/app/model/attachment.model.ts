export interface Attachment {
    id: string,
    entryId: string,
    name: string,
    extension: string,
    type: ResourceType | string,
    size: number,
    dateCreated: number,
    dateUpdated: number
}

export enum ResourceType {
    UPLOAD,
    SCREENSHOT,
    THUMBNAIL,
    DOCUMENT
}

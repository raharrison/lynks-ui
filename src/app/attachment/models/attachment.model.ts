export interface Attachment {
  id: string,
  entryId: string,
  name: string,
  extension: string,
  type: AttachmentType,
  size: number,
  dateCreated: number,
  dateUpdated: number
}

export enum AttachmentType {
  UPLOAD = "Upload",
  SCREENSHOT = "Screenshot",
  THUMBNAIL = "Thumbnail",
  DOCUMENT = "Document"
}

export enum AttachmentCategory {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  PDF = "pdf",
  UNKNOWN = "unknown"
}

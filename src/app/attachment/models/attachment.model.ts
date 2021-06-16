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
  UPLOAD = "UPLOAD", // user uploaded
  SCREENSHOT = "SCREENSHOT", // full page image screenshot
  THUMBNAIL = "THUMBNAIL", // primary image from page or small screenshot
  PREVIEW = "PREVIEW", // small partial page screenshot
  PAGE = "PAGE", // full HTML page
  DOCUMENT = "DOCUMENT", // full page PDF
  READABLE_DOC = "READABLE_DOC", // extracted formatted readable content
  READABLE_TEXT = "READABLE_TEXT", // extracted text content only
  GENERATED = "GENERATED" // task created
}

export enum AttachmentCategory {
  PAGE = "page",
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  PDF = "pdf",
  UNKNOWN = "unknown"
}

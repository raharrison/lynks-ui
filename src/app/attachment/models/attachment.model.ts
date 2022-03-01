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
  UPLOAD = "upload", // user uploaded
  SCREENSHOT = "screenshot", // full page image screenshot
  THUMBNAIL = "thumbnail", // primary image from page or small screenshot
  PREVIEW = "preview", // small partial page screenshot
  PAGE = "page", // full HTML page
  DOCUMENT = "document", // full page PDF
  READABLE_DOC = "readable_doc", // extracted formatted readable content
  READABLE_TEXT = "readable_text", // extracted text content only
  GENERATED = "generated" // task created
}

export enum AttachmentCategory {
  PAGE = "page",
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  PDF = "pdf",
  SUBTITLE = "subtitle",
  UNKNOWN = "unknown"
}

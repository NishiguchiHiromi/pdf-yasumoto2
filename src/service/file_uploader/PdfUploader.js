import { FileUploader } from "./FileUploader"

export class PdfUploader extends FileUploader {
  constructor(...prop) {
    super(...prop)
    this.contentType = 'application/pdf;charset=UTF-8'
    this.base64Prefix = "data:application/pdf;base64,"
  }
}
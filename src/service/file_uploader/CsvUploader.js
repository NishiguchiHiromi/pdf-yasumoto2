import { FileUploader } from "./FileUploader"

export class CsvUploader extends FileUploader {
  constructor(...prop) {
    super(...prop)
    this.contentType = 'text/csv;charset=UTF-8'
    this.base64Prefix = "data:text/csv;base64,"
  }
}
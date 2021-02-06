import { FileUploader } from "./FileUploader"

export class CsvUploader extends FileUploader {
  constructor(...prop) {
    super(...prop)
    this.contentType = 'text/csv;charset=UTF-8'
  }
}
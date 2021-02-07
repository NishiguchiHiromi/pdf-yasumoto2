import { Drive } from "../Drive"
import { Util } from "../Util"

export class FileUploader {
  constructor({ blob, directoryId, filename }) {
    this.blob = blob
    this.directoryId = directoryId
    this.filename = filename
  }

  async upload() {
    const base64 = await this.getBase64()
    return Drive.uploadFile({ filename: this.filename, base64, parentId: this.directoryId, contentType: this.contentType })
  }

  async getBase64() {
    return Util.blobToBase64({ blob: this.blob, prefix: this.base64Prefix })
  }
}
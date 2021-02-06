import { Drive } from "./Drive"
import { Util } from "./Util";

export class FileDownloader {
  constructor({ fileId, filename }) {
    this.fileId = fileId
    this.filename = filename
  }

  async download() {
    const link = document.createElement("a");
    const url = await this.createDataUrl();
    link.download = this.filename;
    link.href = url;
    link.click();
    (window.URL || window.webkitURL).revokeObjectURL(url);
    link.remove()
  }

  async createDataUrl() {
    const res = await Drive.getFile(this.fileId)
    return Util.createDataUrl(new Blob([res.body], { type: "octet/stream" }))
    // const strBase64 = window.btoa(unescape(encodeURIComponent(res.body))); // バイナリデータをbase64にデコード
    // return "data:" + "application/pdf" + ";base64," + strBase64;
  }
}
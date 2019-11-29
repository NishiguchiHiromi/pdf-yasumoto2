
STATUS = Object.freeze({
  notYet: 1,
  fetching: 2,
  uploading: 3,
  finish: 4,
  failed: 9
});
STATUS_TEXT = Object.freeze({
  [STATUS.notYet]: "開始前",
  [STATUS.fetching]: "pdf取得中",
  [STATUS.uploading]: "pdfアップロード中",
  [STATUS.finish]: "完了",
  [STATUS.failed]: "失敗",
});
class Log {
  constructor({ urls, $elArea }) {
    console.log("ログクラス初期化")
    this.$elArea = $elArea
    this.info = urls.reduce((info, url) => {
      info.set(url, {
        url: url,
        status: STATUS.notYet,
        filename: "",
        fileId: "",
        fileData: {},
        errors: [],
      })
      return info
    }, new Map());
    this.progress = { success: 0, failure: 0, all: urls.length }
    this.$elProgress = $(`<p></p>`)
    this.$elArea.append(this.$elProgress)
    this.displayProgress()
  }

  getStatus(url) {
    return STATUS_TEXT[this.info.get(url).status]
  }

  getInfoById(fileId) {
    return Array.from(this.info.values()).find(obj => obj.fileId = fileId)
  }

  getDispObj({ url }) {
    const $el = $("<div class='log'></div>")
    this.$elArea.append($el);
    const obj = {
      log: this,
      $el: $el,
      display: function () {
        this.$el.empty();
        this.$el.append($(`
          <span>
            ${url}
            &nbsp;&nbsp;
            ${STATUS_TEXT[this.log.info.get(url).status]}
            ${this.log.getLinkArea(url)}
          </span>
        `))
        this.log.displayProgress()
      }
    }
    obj.display()
    return obj
  }

  getLinkArea(url) {
    if (this.info.get(url).status == STATUS.finish) {
      return `
        &nbsp;&nbsp;
        <button class="fileView" value="${this.info.get(url).fileData.webViewLink}">閲覧</button>
        <button class="fileDownload" value="${this.info.get(url).fileId}">ダウンロード</button>
      `
    } else {
      return ""
    }
  }

  setInfo({ url, status, filename, fileId, fileData }) {
    if (!url) throw new Error("urlを指定してください");
    const info = this.info.get(url)
    info.status = status || info.status;
    info.filename = filename || info.filename;
    info.fileId = fileId || info.fileId;
    info.fileData = fileData || info.fileData;

    if (status == STATUS.finish) {
      this.progress.success++
    }

    console.log(this.info.get(url))
  }

  setError({ url, error }) {
    if (!url) throw new Error("urlを指定してください");
    const info = this.info.get(url)
    info.errors.push(error)
    if (info.status != STATUS.failed) {
      this.progress.failure++
    }
    info.status = STATUS.failed
    console.log(this.info.get(url))
  }

  displayProgress() {
    this.$elProgress.text(`成功：${this.progress.success}　失敗：${this.progress.failure}　全件数：${this.progress.all}`)
  }

  getLogFileBlob() {
    const data = []
    // summary
    data.push(["成功", "失敗", "全件数"])
    data.push([this.progress.success, this.progress.failure, this.progress.all])
    data.push([])
    // detail
    data.push(["url", "結果", "ファイル名", "エラー"])
    Array.from(this.info.values()).forEach(obj => {
      let errors = ""
      if (obj.errors.length) {
        errors = obj.errors.map(error => JSON.stringify(error, Object.getOwnPropertyNames(error)))
        errors = JSON.stringify(errors).replace(/,/g, '，')
      }
      data.push([obj.url, STATUS_TEXT[obj.status], obj.filename, errors])
    })
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const csv_data = data.map(l => { return l.join(',') }).join('\r\n');
    return new Blob([bom, csv_data], { type: 'text/csv' });
  }
}
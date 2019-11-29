const util = new Util();

/**
 *  On load, called to load the auth2 library and API client library.
 */
const main = () => {
  const lib = new Main();
  lib.setDeafultParam();
  lib.addEventListners();
}

class Main {
  constructor() {
    console.log("Mainインスタンス作成")
    this.drive = new Drive({
      authorizeButton: this.authorizeButton,
      signoutButton: this.signoutButton,
      showLoginField: () => this.showLoginField(),
      hideLoginFIeld: () => this.hideLoginFIeld(),
      mainInit: () => this.init()
    });
    this.db = new DB()
    this.modal = new Modal()
    this.$elUrlParamList = $("#url_param_list");
    this.$elParamList = $("#param_list");
  }

  authorizeButton = document.getElementById('authorize_button');
  signoutButton = document.getElementById('signout_button');

  showLoginField() {
    console.log("ログインエリア表示")
    $("#main").show();
    $("#signed_out_area").hide();
  }

  hideLoginFIeld() {
    console.log("ログインエリア非表示")
    $("#main").hide();
    $("#signed_out_area").show();
  }

  init() {
    console.log("Mainインスタンス初期化")
    this.setFolders()
  }

  setDeafultParam() {
    console.log("デフォルトパラメータ設定")
    this.addSettingParam()
    this.addUrlParam()
    $("#param1_from").val(1)
    $("#param1_to").val(1)
    $("#url").val("https://www.fld.caa.go.jp/caaks/cssc06/youshiki5?yousiki5216File=A");
    this.setUrlParam([{ select: 1, input: "%255CA" }, { select: 1, input: "_youshiki5.pdf" }])
  }

  addEventListners() {
    console.log("イベントリスナ付与")
    $("#add_param").on("click", () => this.addSettingParam())
    $("body").on("click", ".delete", e => this.deleteSettingParam(e))
    $("#add_url_param").on("click", () => this.addUrlParam())
    $("#delete_url_param").on("click", () => this.deleteUrlParam())
    $("#createFolder").on("click", async () => this.createFolder())
    $("#exec").on("click", () => this.exec())
    $("body").on("click", "#stop", () => this.exit())
    $("body").on("click", ".fileView", e => this.fileView(e))
    $("body").on("click", ".fileDownload", e => this.fileDownload(e))
    $("body").on("click", "#result", () => this.resultCsvDownload())
  }

  getSettingParamTemplate(num) {
    return `
      <li class="param">
          パラメータ${num}：
          <label for="param${num}_from">from:</label>
          <input id="param${num}_from" type="number">
          &nbsp;&nbsp;
          <label for="param${num}_to">to:</label>
          <input id="param${num}_to" type="number">
          &nbsp;&nbsp;
          <button class="delete">削除</button>
          <input type="hidden" class="number" value="${num}">
      </li>
      `;
  };

  getUrlParamTemplate(data = {}) {
    const options = this.db.visibleParams
      .map(info => `<option value="${info.num}" ${data.select == info.num ? "selected=true" : ""}>${info.name}</option>`)
      .join("")
    return `
      <span class="url_param">
        <select>
          ${options}
        </select>
        <input type="text" value="${data.input || ""}">
      </span>
    `
  }

  // ------------------------------

  get $elParams() {
    return $(".param");
  }

  addSettingParam() {
    console.log("パラメータ設定追加")
    const newInfo = this.db.addParam()
    const el = $(this.getSettingParamTemplate(newInfo.num));
    this.$elParamList.append(el);
    this.setUrlParam();
  }

  deleteSettingParam(e) {
    console.log("パラメータ設定削除")
    const $elButton = $(e.target);
    $elButton.parents("li").hide();
    const num = $elButton.next(".number").val();
    this.db.deleteParam(num)
    this.setUrlParam();
  }

  setUrlParam(param) {
    console.log("URLパラメータ設定")
    const paramBk = param || $(".url_param").map((index, element) => {
      const select = $(element).find("select").val();
      const input = $(element).find("input").val();
      return { select: select, input: input }
    });
    this.$elUrlParamList.empty();
    [...Array(this.db.urlParamCount)].forEach((_, index) => {
      this.$elUrlParamList.append($(this.getUrlParamTemplate(paramBk[index])))
    });
  }

  async setFolders() {
    console.log("フォルダ選択肢設定")
    $(".folderSelect").empty();
    const files = await this.drive.getFolders()
    files.forEach(file => {
      $(".folderSelect").append($(`
          <option value="${file.id}">${file.name}</option>
        `))
    })
  }

  addUrlParam() {
    console.log("URLパラメータ追加")
    this.db.addUrlParam();
    this.setUrlParam();
  }

  deleteUrlParam() {
    console.log("URLパラメータ削除")
    this.db.deleteUrlParam();
    this.setUrlParam();
  }

  async createFolder() {
    console.log("フォルダ追加")
    await this.drive.createFolder({
      folderName: $("#folderName").val(),
      parentId: $("#parentIdAddFolder").val()
    })
    this.setFolders()
  }

  get urlParamNums() {
    const allParamNums = Array.from(
      this.$elUrlParamList.find("select")
        .map((index, element) => Number($(element).val()))
    );
    return [...new Set(allParamNums)];
  }

  get urlInfo() {
    let url = $("#url").val();
    $(".url_param").each((index, element) => {
      const paramNum = $(element).find("select").val();
      const partialUrl = $(element).find("input").val();
      url += `{param${paramNum}}${partialUrl}`
    });
    console.log("urlTemplate: ", url)
    return url;
  }

  stop = false;
  log = null;
  $elPrgressDispArea = null
  async exec() {
    console.log("スクレイピング開始")
    this.reset();
    this.$elPrgressDispArea = $(`
      <div id="progress">
        <div style="text-align: right;">
          <button id="stop">中断</button>
        </div>
      </div>
    `)
    this.modal.open(this.$elPrgressDispArea);
    const urlTemplate = this.urlInfo;
    const nums = this.urlParamNums
    const paramValueArr = this.db.getParamValueArr(nums);
    const urls = paramValueArr.map(info => {
      let template = urlTemplate;
      Object.entries(info).forEach(([key, value]) => {
        const reg = new RegExp(`{param${key}}`, 'g');
        template = template.replace(reg, value)
      })
      return template
    })
    console.log("url：", urls)
    this.log = new Log({ urls, $elArea: this.$elPrgressDispArea })
    const parentId = $("#parentIdAddFolder").val()
    for (var url of urls) {
      if (this.stop) {
        console.error("中断処理が完了しました。")
        break
      }
      await this.fetch({ url, parentId });
      await util.sleep(1000)
    }
    if (!this.stop) {
      this.$elPrgressDispArea.append($('<h3 style="text-align: center;color: green;border: solid 1px green;">完了しました。</h3> '))
      this.setResult()
    }
  }

  async fetch({ url, parentId }) {
    console.warn("start", url)
    const dispObj = this.log.getDispObj({ url })
    dispObj.display()
    try {
      this.log.setInfo({ url, status: STATUS.fetching })
      dispObj.display()

      const res = await fetch(`/pdf?url=${url}`)
      // サーバーとの通信の成否確認 
      if (!res.ok) {
        this.log.setError({ url, error: res })
        throw new Error("pdfの取得に失敗しました");
      }

      // 取得PDFを処理
      console.log("pdf取得完了")
      const filename = util.getFileName(res)
      this.log.setInfo({ url, status: STATUS.uploading, filename })
      dispObj.display()

      const blob = await res.blob().catch(error => { throw new Error("ファイルの変換に失敗しました") });
      console.log("ファイル変換完了")

      // ファイルをアップロード
      const file = await this.drive.uploadPdf({ filename, blob, parentId })
      console.log("ファイルアップロード完了")

      // アップロード後のレスポンスを処理
      this.log.setInfo({ url, status: STATUS.finish, fileId: file.id, fileData: file })
      dispObj.display()
    } catch (e) {
      this.log.setError({ url, error: e })
      dispObj.display()
    }
    return Promise.resolve()
  }

  exit() {
    console.error("中断します")
    this.stop = true
    this.$elPrgressDispArea.append($('<h3 style="text-align: center;color: red;border: solid 1px red;">中断しました。</h3>'))
    this.setResult()
  }

  reset() {
    this.stop = false
  }

  fileView(e) {
    console.log("ファイル表示")
    const link = $(e.target).val()
    window.open(link)
  }

  async fileDownload(e) {
    console.log("ファイルダウンロード")
    const fileId = $(e.target).val()
    const fileInfo = this.log.getInfoById(fileId)
    const filename = fileInfo.filename;
    const res = await this.drive.getFile(fileId)
    console.log("ファイル取得完了", res)
    const strBase64 = window.btoa(res.body);  // バイナリデータをbase64にデコード
    const dataUrl = 'data:' + "application/pdf" + ';base64,' + strBase64;
    this.download({ dataUrl, filename })
  }

  resultCsvDownload() {
    this.download({ dataUrl: this.resultCsv.dataUrl, filename: this.resultCsv.filename })
  }

  download({ dataUrl, filename }) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    (window.URL || window.webkitURL).revokeObjectURL(dataUrl);
  }

  resultCsv = { filename: null, dataUrl: null, blob: null }
  setResult() {
    this.resultCsv.blob = this.log.getLogFileBlob();
    this.resultCsv.dataUrl = (window.URL || window.webkitURL).createObjectURL(this.resultCsv.blob);
    this.resultCsv.filename = util.getNowNumber() + "_result.csv"
    this.$elPrgressDispArea.append($(`
      <div style="text-align: right;">
        <button id="result">実行結果CSVをダウンロード</button>
      </div>
    `))
    this.drive.uploadCsv({
      filename: this.resultCsv.filename,
      blob: this.resultCsv.blob,
      parentId: $("#parentIdAddFolder").val(),
      contentType: 'text/csv'
    })
  }
}
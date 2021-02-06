import { FileScraper } from "./service/FileScraper";
import { PdfUploader } from "./service/file_uploader/PdfUploader";
import { Util } from "./service/Util";

let manager;
// const listners = {
//   start: ({ info }) => {
//     manager = new FileManager(info)
//     manager.start();
//   },
//   stop: () => {
//     manager.stop();
//   },
// }

self.addEventListener('message', function (e) {
  if (e.data.type === "start") {
    manager = new FileManager(info)
    manager.start();
  } else if (e.data.type === "stop") {
    manager.stop();
  }
  // listners[e.data.type](e.data)
}, false);

class FileManager {
  constructor(info) {
    console.log(info, "infoきた")
    this.info = info
    this.stoped = false
  }

  async start() {
    for (var fileInfo of this.info) {
      try {
        if (stoped) break;

        const scraper = new FileScraper({ url: fileInfo.url });
        await scraper.fetch();

        // ファイル変換
        setInfo({ id: fileInfo.id, status: STATUS.converting });
        const blob = await scraper.getBlob();

        // ファイルアップロード
        setInfo({ id: fileInfo.id, status: STATUS.uploading });
        const uploader = new PdfUploader({
          blob,
          directoryId,
          filename: fileInfo.filename,
        });
        const file = await uploader.upload();

        // 完了
        setInfo({
          id: fileInfo.id,
          status: STATUS.finish,
          fileId: file.id,
          fileData: file,
        });
      } catch (e) {
        setInfo({ id: fileInfo.id, status: STATUS.failed, error: e });
      }

      // 1秒待機
      await Util.sleep(1000);
    }
    // self.postMessage("start");
    // setTimeout(() => {
    //   this.stop()
    // }, 1000);
  }
  stop() {
    this.stoped = true
  }

  setInfo(i) {
    self.postMessage({ type: "progress", info: info });
  }

  postMessage(msg) {
    self.postMessage(msg);
  }
}
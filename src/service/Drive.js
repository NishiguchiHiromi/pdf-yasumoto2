import { gapi } from 'gapi-script';
export class Drive {
  static createFolder({ folderName, parentId }) {
    console.log("createFolder", "arguments", arguments)
    return new Promise((resolve, reject) => {
      gapi.client.drive.files.create({
        resource: {
          "name": folderName,
          parents: [parentId],
          'mimeType': 'application/vnd.google-apps.folder'
        },
      }).execute((res) => {
        console.log("createFolder", "レスポンス", res)
        if (res.code && res.code != 200) {
          reject("フォルダの作成に失敗しました")
        } else {
          resolve(res)
        }
      });
    })
  }

  static getFolders({ parentId } = {}) {
    return this.getFiles({ parentId, isFolder: true })
  }

  static getFiles({ parentId, isFolder = false } = {}) {
    console.log("getFiles", "arguments", arguments)
    return new Promise((resolve, reject) => {
      const q = ["trashed=false"]
      if (parentId) {
        q.push(`'${parentId}' in parents`)
      }
      if (isFolder) {
        q.push(`mimeType = 'application/vnd.google-apps.folder'`)
      } else {
        q.push(`mimeType != 'application/vnd.google-apps.folder'`)
      }
      gapi.client.drive.files.list({
        q: q.join(" and "),
        spaces: 'drive',
        fields: 'files(parents, id, name, kind, size, mimeType, lastModifyingUser, modifiedTime, iconLink, owners, folderColorRgb, shared, webViewLink, webContentLink), nextPageToken'
      }).execute(res => {
        console.log("getFiles", "レスポンス", res)
        if (res.code && res.code != 200) {
          reject("ファイル/フォルダ一覧の取得に失敗しました")
        } else {
          resolve(res.files)
        }
      });
    })
  }

  static getFile(fileId) {
    console.log("getFile", "arguments", arguments)
    return new Promise((resolve, reject) => {
      gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }).then(res => {
        console.log("getFile", "レスポンス", res)
        if (res.code && res.code != 200) {
          reject("pdfのダウンロードに失敗しました")
        } else {
          resolve(res)
        }
      });
    })
  }

  static async uploadFile({ filename, base64, parentId, contentType }) {
    console.log("uploadFile", "arguments", arguments)

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    var metadata = {
      'name': filename,
      'mimeType': contentType,
      parents: [parentId],
    };

    var multipartRequestBody = delimiter +
      'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' + base64 + close_delim;


    return new Promise((resolve, reject) => {
      gapi.client
        .request({
          path: "/upload/drive/v3/files/",
          method: "POST",
          params: {
            uploadType: "multipart",
            fields: 'id,name,kind,size,mimeType,lastModifyingUser,modifiedTime,iconLink,owners,folderColorRgb,shared,webViewLink,webContentLink'
          },
          headers: {
            "Content-Type": 'multipart/mixed; boundary="' + boundary + '"',
          },
          body: multipartRequestBody
        })
        .execute(function (file) {
          console.log("uploadFile", "レスポンス", file)
          if (file) {
            resolve(file);
          } else {
            reject("アップロードに失敗しました")
          }
        });
    })
  }
}
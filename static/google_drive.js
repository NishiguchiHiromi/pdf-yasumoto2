// Client ID and API key from the Developer Console
const CLIENT_ID = '332113919380-dqb0076eim4p14p6pcv88nmg2j46im4a.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDviN1mLnga8oRIK1TD2nFPnnSpUIxYVrI';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
const SCOPES = 'https://www.googleapis.com/auth/drive';

let self
class Drive {
  constructor({
    authorizeButton,
    signoutButton,
    showLoginField,
    hideLoginFIeld,
    mainInit
  }) {
    self = this
    self.authorizeButton = authorizeButton
    self.signoutButton = signoutButton
    self.showLoginField = showLoginField
    self.hideLoginFIeld = hideLoginFIeld
    self.mainInit = mainInit
    gapi.load('client:auth2', this.initClient)
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  // async initClient(resolve) {
  async initClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).catch(error => {
      console.error(JSON.stringify(error, null, 2));
    })
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(self.updateSigninStatus);

    // Handle the initial sign-in state.
    self.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    self.authorizeButton.onclick = self.handleAuthClick;
    self.signoutButton.onclick = self.handleSignoutClick;
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      self.showLoginField();
      self.mainInit();
    } else {
      self.hideLoginFIeld();
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  createFolder({ folderName, parentId }) {
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

  getFolders({ parentId } = {}) {
    return this.getFiles({ isFolder: true })
  }

  getFiles({ parentId, isFolder = false } = {}) {
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
        fields: 'files(id, name, kind, size, mimeType, lastModifyingUser, modifiedTime, iconLink, owners, folderColorRgb, shared, webViewLink, webContentLink), nextPageToken'
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

  getFile(fileId) {
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

  uploadPdf({ filename, blob, parentId }) {
    return this.uploadFile({ filename, blob, parentId, contentType: 'application/pdf;charset=UTF-8', base64Prefix: "data:application/pdf;base64," })
  }

  uploadCsv({ filename, blob, parentId }) {
    return this.uploadFile({ filename, blob, parentId, contentType: 'text/csv;charset=UTF-8', base64Prefix: "data:text/csv;base64," })
  }
  // 'application/vnd.ms-excel#filename.csv;charset=UTF-8'

  async uploadFile({ filename, blob, parentId, contentType, base64Prefix }) {
    console.log("uploadFile", "arguments", arguments)
    const base64Data = await util.blobToBase64({ blob, prefix: base64Prefix })

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
      '\r\n' + base64Data + close_delim;


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
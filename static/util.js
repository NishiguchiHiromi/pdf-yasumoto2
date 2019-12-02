class Util {
  blobToBase64 = ({ blob, prefix }) => {
    console.log("blob => base64")
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = function (evt) {
        const data = evt.target.result
        resolve(data.replace(prefix, ''));
      }
      fr.readAsDataURL(blob);
    })
  }

  getFileName = res => {
    let filename;
    const disposition = res.headers.get("content-disposition")
    // if (disposition && disposition.indexOf('inline') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
    // }
    if (!filename) {
      const url = res.url
      const slashIndex = url.lastIndexOf("/")
      filename = url.substr(slashIndex + 1)
    }
    if (!/.+\.pdf$/.test(filename)) {
      filename += ".pdf"
    }
    return filename;
  }

  getNowNumber() {
    const dt = new Date();
    const y = dt.getFullYear();
    const m = ("00" + (dt.getMonth() + 1)).slice(-2);
    const d = ("00" + dt.getDate()).slice(-2);
    let hh = dt.getHours();
    let mi = dt.getMinutes();
    let ss = dt.getSeconds();
    hh = ("00" + hh).slice(-2);
    mi = ("00" + mi).slice(-2);
    ss = ("00" + ss).slice(-2);
    const result = y + m + d + hh + mi + ss;
    return result;
  }

  sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

}
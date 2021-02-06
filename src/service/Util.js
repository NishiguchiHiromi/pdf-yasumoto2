export class Util {
  static async blobToBase64(blob) {
    return this.createDataUrl(blob).then(url => url.replace(/data:.*\/.*;base64,/, ''))
  }

  static async createDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = (evt) => {
        resolve(evt.target.result)
      }
      fr.readAsDataURL(blob);
    })
  }

  static getNowNumber() {
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
    return y + m + d + hh + mi + ss;
  }

  static sleep = msec => new Promise(resolve => setTimeout(resolve, msec))
}
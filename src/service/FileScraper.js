export class FileScraper {
  constructor({ url }) {
    // this.serverRoot = "http://localhost:5500"
    this.serverRoot = "https://boiling-dusk-96001.herokuapp.com"
    this.url = url
  }

  async fetch() {
    this.res = await fetch(`${this.serverRoot}/pdf?url=${this.url}`)
    if (!this.res.ok) {
      throw this.res
    }
  }

  getBlob() {
    return this.res.blob()
  }
}
export class FileScraper {
  constructor({ url }) {
    this.serverRoot = "localhost:5500"
    this.url = url
  }

  async fetch() {
    this.res = await fetch(`http://${this.serverRoot}/pdf?url=${this.url}`)
    if (!this.res.ok) {
      throw this.res
    }
  }

  getBlob() {
    return this.res.blob()
  }
}
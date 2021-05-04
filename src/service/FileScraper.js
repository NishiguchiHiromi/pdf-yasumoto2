export class FileScraper {
  constructor({ url }) {
    this.serverRoot = process.env.BASE_URL
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
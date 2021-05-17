
import chokidar from 'chokidar'

export class CodeWatcher {
  fd: any
  $service: any
  folder: string

  constructor ($service: any, folder: string) {
    this.$service = $service
    this.folder = folder
  }

  start (opts: { time: number }) {
    this.fd = chokidar.watch(this.folder, {
      ignored: /node_modules|dist|sqlite/,
      interval: 10_000,
      depth: 10
    }).on('all', async (event: any, file: string) => {
      if (event === 'change') {
        await this.store({
          time: Date.now(),
          project: this.getProject(file)
        })
      }
    })
  }

  async stop () {
    this.fd.close()
  }

  async store (opts: { time: number, project: string }) {
    await this.$service.writeCode(opts)
    await this.$service.setLastUpdate('code', opts.time)
  }

  getProject (fpath: string) {
    return fpath.replace(this.folder, '').split('/')[1]
  }
}

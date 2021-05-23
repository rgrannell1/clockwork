
import chokidar from 'chokidar'
import signale from 'signale'

import config from '../config/default.js'
import { CommonService } from '../store/common-service.js'

export class CodeWatcher {
  fd: any
  $service: CommonService
  folder: string

  constructor ($service: any, folder: string) {
    this.$service = $service
    this.folder = folder
  }

  start (opts: { time: number }) {
    signale.info(`🕰 watching ${this.folder} for code-changes`)

    this.fd = chokidar.watch(this.folder, {
      ignored: config.app.ignoredCode,
      interval: 10_000,
      depth: 10
    }).on('all', async (event: any, file: string) => {
      if (event === 'change') {
        await this.store({
          time: Date.now(),
          file,
          project: this.getProject(file)
        })
      }
    })
  }

  async stop () {
    this.fd.close()
  }

  async store (opts: { time: number, file: string, project: string }) {
    await this.$service.writeCode(opts)
    await this.$service.setLastUpdate('code', opts.time)
  }

  getProject (fpath: string) {
    return fpath.replace(this.folder, '').split('/')[1]
  }
}

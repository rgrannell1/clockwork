
import chokidar from 'chokidar'
import signale from 'signale'

import config from '../config/default.js'
import { CommonService } from '../store/common-service.js'

export class CodeWatcher {
  fd: any
  $service: CommonService
  folder: string
  flushPid: NodeJS.Timeout | undefined
  buffer: Array<{ time: number, file: string, project: string }> = []

  BATCH_UPDATE_THRESHOLD = 100

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
      // -- avoid "bulk" refactors and touch invokations here.
      if (event === 'change') {

       if (!this.flushPid) {
         this.flushPid = setTimeout(async () => {
          await this.flush()
          this.flushPid = undefined
        }, 10_000)
       }

       this.buffer.push({
         time: Date.now(),
         file,
         project: this.getProject(file)
       })
      }
    })
  }

  async flush () {
    if (this.buffer.length > this.BATCH_UPDATE_THRESHOLD) {
      this.buffer = []
    }

    for (const update of this.buffer) {
      await this.store(update)
    }

    this.buffer = []
  }

  async stop () {
    this.fd.close()
  }

  async store (opts: { time: number, file: string, project: string }) {
    await this.$service.writeCode(opts)
    await this.$service.setLastUpdate('code', opts.time)
  }

  getProject (fpath: string) {
    const parts = fpath.replace(this.folder, '').split('/')
    return parts[1]
  }
}

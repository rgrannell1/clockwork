
import chokidar from 'chokidar'
import signale from 'signale'

import config from '../config/default.js'
import { CommonService } from '../store/common-service.js'

export class NotesWatcher {
  fd: any
  $service: CommonService
  folder: string
  flushPid: NodeJS.Timeout | undefined
  buffer: Array<{ time: number }> = []

  BATCH_UPDATE_THRESHOLD = 20

  constructor($service: any, folder: string) {
    this.$service = $service
    this.folder = folder
  }

  start (opts: { time: number }) {
    signale.info(`🕰 watching ${this.folder} for notes changes`)

    this.fd = chokidar.watch(this.folder, {
      ignored: config.app.ignoredNotes,
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
          time: Date.now()
        })
      }
    })
  }

  async flush() {
    if (this.buffer.length > this.BATCH_UPDATE_THRESHOLD) {
      this.buffer = []
    }

    for (const update of this.buffer) {
      await this.store(update)
    }

    this.buffer = []
  }

  async stop() {
    this.fd.close()
  }

  async store(opts: { time: number }) {
    await this.$service.writeNotes(opts)
    await this.$service.setLastUpdate('notes', opts.time)
  }
}


import * as fs from 'fs'
import signale from 'signale'
import { CommonService } from '../store/common-service'

export class ShellHistoryWatcher {
  pid: any
  fd: any
  $service: CommonService
  fpath: string

  constructor ($service: CommonService, fpath: string) {
    this.$service = $service
    this.fpath = fpath
  }

  start () {
    signale.info(`🕰 watching ${this.fpath} for history`)

    this.fd = fs.watch(this.fpath, async (eventType: string) => {
      await this.store({
        time: Date.now()
      })
    })
  }

  stop () {
    this.fd.close()
  }

  async store (opts: { time: number }) {
    await this.$service.writeHistory(opts)
    await this.$service.setLastUpdate('history', opts.time)
  }
}

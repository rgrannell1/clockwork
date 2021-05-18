
import * as fs from 'fs'
import signale from 'signale'

export class ShellHistoryWatcher {
  pid: any
  fd: any
  $service: any
  fpath: string

  constructor ($service: any, fpath: string) {
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

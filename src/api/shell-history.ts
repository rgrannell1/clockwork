
import * as fs from 'fs'

export class ShellHistoryWatcher {
  pid: any
  fd: any
  $service: any

  constructor ($service: any) {
    this.$service = $service
  }

  start () {
    this.fd = fs.watch('/home/rg/.zsh_history', async (eventType: string) => {
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

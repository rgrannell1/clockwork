
import fetch from 'node-fetch'

export class HeartbeatWatcher {
  $service: any
  pid: any

  constructor($service: any) {
    this.$service = $service
  }

  start() {
    this.pid = setInterval(async () => {
      await this.store({
        time: Date.now()
      })
    }, 300_000)
  }

  stop() {
    clearInterval(this.pid)
  }

  async store(opts: { time: number }) {
    await this.$service.writeHeartbeat(opts)
    await this.$service.setLastUpdate('heartbeat', opts.time)
  }
}

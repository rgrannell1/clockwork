
import fetch from 'node-fetch'
import { CommonService } from '../store/common-service'

export class HeartbeatWatcher {
  $service: CommonService
  pid: any

  constructor ($service: any) {
    this.$service = $service
  }

  start () {
    this.pid = setInterval(async () => {
      await this.store({
        time: Date.now()
      })
    }, 300_000)
  }

  stop () {
    clearInterval(this.pid)
  }

  async store(opts: { time: number }) {
    await this.$service.writeHeartbeatStatus(opts)
    await this.$service.setLastUpdate('heartbeat', opts.time)
  }
}

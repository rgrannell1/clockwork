
import fetch from 'node-fetch'
import signale from 'signale'
import { CommonService } from '../store/common-service'

export class PinboardWatcher {
  $service: CommonService
  pid: any
  key: string

  constructor($service: any, key: string) {
    this.$service = $service
    this.key = key
  }

  start (opts: { time: number }) {
    let state = (new Date(opts.time)).getTime()

    this.pid = setInterval(async () => {
      signale.info('🕰 fetching pinboard bookmark status.')

      const response = await fetch(`https://api.pinboard.in/v1/posts/update?format=json&auth_token=${this.key}`)
      const content = await response.json()

      if (state !== content.update_time) {
        state = content.update_time
        this.store({
          time: Date.now()
        })
      }

    }, 300_000)
  }

  stop () {
    clearInterval(this.pid)
  }

  async store (opts: { time: number }) {
    await this.$service.writeBookmark(opts)
    await this.$service.setLastUpdate('pinboard', opts.time)
  }
}

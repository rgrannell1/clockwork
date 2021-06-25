
import fetch from 'node-fetch'
import signale from 'signale'

export class TwitterWatcher {
  $service: any
  pid: any
  id: string
  token: string
  DEFAULT_TIME = 1291593660_000

  constructor ($service: any, id: string, token: string) {
    this.$service = $service
    this.id = id
    this.token = token
  }

  start () {
    this.pid = setInterval(async () => {
      const time = await this.$service.getLastUpdate('twitter', this.DEFAULT_TIME)

      const formattedDate = (new Date(time)).toISOString()
      const res = await fetch(`https://api.twitter.com/2/users/${this.id}/tweets?start_time=${formattedDate}&tweet.fields=created_at`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })

      const json = await res.json()

      if (json.errors) {
        for (const error of json.errors) {
          signale.error(`${JSON.stringify(error, null, 2)}`)
        }
      } else {
        for (const tweet of json.data) {
          const tweetTime = (new Date(tweet.created_at)).getTime()

          await this.store({
            time: tweetTime
          })
        }
      }
    }, 300_000)
  }

  stop() {
    clearInterval(this.pid)
  }

  async store (opts: { time: number }) {
    await this.$service.writeTweet(opts)
    await this.$service.setLastUpdate('twitter', opts.time)
  }
}


import fetch from 'node-fetch'
import signale from 'signale'

async function * tweets (time?: number) {
  const startTime = time
    ? time
    : this.DEFAULT_TIME

  // -- create an initial request
  const formattedDate = (new Date(startTime)).toISOString()
  let res = await fetch(`https://api.twitter.com/2/users/${this.id}/tweets?start_time=${formattedDate}&tweet.fields=created_at`, {
    headers: {
      Authorization: `Bearer ${this.token}`
    }
  })

  let json = await res.json()

  if (json.errors) {
    for (const error of json.errors) {
      signale.error(error.details)
    }

    throw new Error('initial step in twitter-sync failed.')
  }

  let maxTime

  // -- capture the most recent date and yield the first few tweets.
  for (const tweet of json.data) {
    const tweetTime = (new Date(tweet)).getTime()

    if (!maxTime) {
      maxTime = tweetTime
    }

    maxTime = Math.max(maxTime, tweetTime)
    yield tweet
  }

  while (json.meta) {
    console.log(json)
  }

  // -- now traverse through the next tokens until there are no more
}

class TwitterRest {
  id: string
  token: string

  DEFAULT_TIME = 1291593660_000

  constructor (id: string, token: string) {
    this.id = id
    this.token = token
  }

  tweets = tweets
}

export class TwitterWatcher {
  $service: any
  pid: any
  id: string
  token: string

  constructor ($service: any, id: string, token: string) {
    this.$service = $service
    this.id = id
    this.token = token
  }

  start (opts: {time: number}) {
    this.pid = setInterval(async () => {
      const formattedDate = (new Date(1291593660_000)).toISOString()
      const res = await fetch(`https://api.twitter.com/2/users/${this.id}/tweets?start_time=${formattedDate}&tweet.fields=created_at`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })

      const json = await res.json()

      if (json.errors) {
        for (const error of json.errors) {
          signale.error(`${error.detail}`)
        }
      } else {
        console.log(json)

        for (const tweet of json.data) {
          console.log(tweet)
        }

      }
    }, 30_000)
  }

  stop() {
    clearInterval(this.pid)
  }

  async store (opts: { time: number }) {
    await this.$service.writeTweet(opts)
    await this.$service.setLastUpdate('twitter', opts.time)
  }
}


import fetch from 'node-fetch'
import { CommonService } from '../store/common-service'

export class SteamWatcher {
  $service: CommonService
  key: string
  steamId: string

  constructor ($service: CommonService, key: string, steamId: string) {
    this.$service = $service
    this.key = key
    this.steamId = steamId
  }

  start () {
    setInterval(async () => {
      const res = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?key=${this.key}&steamids=${this.steamId}`)
      const json = await res.json()

      if (json?.response?.players[0]?.gameextrainfo) {
        const game = json?.response?.players[0]?.gameextrainfo

        await this.store({ time: Date.now(), game })
      }
    }, 300_000)
  }

  stop () {

  }

  async store(opts: { time: number, game: string }) {
    await this.$service.writeSteamStatus(opts)
    await this.$service.setLastUpdate('steam', opts.time)
  }
}

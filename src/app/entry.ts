
import signale from 'signale'

import config from '../config/default.js'

import { CodeWatcher } from '../api/code.js'
import { PinboardWatcher } from "../api/pinboard.js"
import { ShellHistoryWatcher } from "../api/shell-history.js"
import { HistoryTrendsWatcher } from '../api/history-trends.js'
import { SteamWatcher } from '../api/steam.js'

import { CommonService } from "../store/common-service.js"
import { HistoryTrendsService } from '../store/history-trends-service.js'

const main = async () => {
  signale.info('🕰 starting clockwork')

  const $service = new CommonService(await CommonService.connect(config.app.home))
  await $service.up()

  const shellJob = new ShellHistoryWatcher($service, config.app.shellHistory)
  const pinboardJob = new PinboardWatcher($service, config.pinboard.key)
  const codeJob = new CodeWatcher($service, config.app.codeFolder)
  const steamJob = new SteamWatcher($service, config.steam.key, config.steam.steamId)

  shellJob.start()
  steamJob.start()

  pinboardJob.start({
    time: await $service.getLastUpdate('pinboard')
  })

  codeJob.start({
    time: await $service.getLastUpdate('code')
  })

  const $historyTrends = new HistoryTrendsService(config.app.chromeDb)
  const chromeHistoryJob = new HistoryTrendsWatcher($historyTrends, $service, config.app.chromeDb)

  chromeHistoryJob.start({
    maxId: await $service.getMaxVisitId()
  })

  setInterval(() => {
    signale.info(`🕰 ${$service.stats.code} code-changes | ${$service.stats.history} shell-history-changes | ${$service.stats.bookmark} bookmark updates | ${$service.stats.web} website visits | ${$service.stats.steam} game chunks`)
  }, 60_000)

  signale.info('🕰 all jobs started')
}

main()

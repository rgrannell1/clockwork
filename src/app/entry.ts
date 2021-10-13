
import signale from 'signale'

import config from '../config/default.js'

import { CodeWatcher } from '../api/code.js'
import { PinboardWatcher } from "../api/pinboard.js"
import { ShellHistoryWatcher } from "../api/shell-history.js"
import { HistoryTrendsWatcher } from '../api/history-trends.js'
import { SteamWatcher } from '../api/steam.js'

import { CommonService } from "../store/common-service.js"
import { HistoryTrendsService } from '../store/history-trends-service.js'
import { HeartbeatWatcher } from '../api/heartbeat.js'
import { TwitterWatcher } from '../api/twitter.js'
import { TodoistWatcher } from '../api/todoist.js'
import { NotesWatcher } from '../api/notes.js'
import { ObsidianStatsWatcher } from '../api/obsidian-stats.js'

/**
 * Log the number of updates made in total.
 *
 * @param $service the common-service
 *
 */
const logActivity = ($service: CommonService) => {
  const message = [
    `🕰 ${$service.stats.code} code-changes`,
    `${$service.stats.history} shell-history-changes`,
    `${$service.stats.bookmark} bookmark updates`,
    `${ $service.stats.steam } game chunks`,
    `${$service.stats.heartbeat} heartbeats`,
    `${$service.stats.twitter} tweets`,
    `${$service.stats.todoist} todos done`,
    `${$service.stats.notes} notes updated`
  ].join(' | ')

  signale.info(message)
}

/**
 * The main application.
 */
const main = async () => {
  signale.info('🕰 starting clockwork')

  const $service = new CommonService(await CommonService.connect(config.app.home))
  await $service.up()

  // -- instantiate and start each job
  const shellJob = new ShellHistoryWatcher($service, config.app.shellHistory)
  const pinboardJob = new PinboardWatcher($service, config.pinboard.key)
  const codeJob = new CodeWatcher($service, config.app.codeFolder)
  const noteJob = new NotesWatcher($service, config.app.noteFolder)
  const steamJob = new SteamWatcher($service, config.steam.key, config.steam.steamId)
  const heartbeatJob = new HeartbeatWatcher($service)
  const twitterJob = new TwitterWatcher($service, config.twitter.id, config.twitter.token)
  const todoistJob = new TodoistWatcher($service, config.todoist.token)
  const obsidianStatsJob = new ObsidianStatsWatcher($service, config.app.noteFolder)

  shellJob.start()
  steamJob.start()
  heartbeatJob.start()
  twitterJob.start()
  todoistJob.start()
  obsidianStatsJob.start()

  pinboardJob.start({
    time: await $service.getLastUpdate('pinboard')
  })

  codeJob.start({
    time: await $service.getLastUpdate('code')
  })
  noteJob.start({
    time: await $service.getLastUpdate('notes')
  })

  const $historyTrends = new HistoryTrendsService(config.app.chromeDb)
  const chromeHistoryJob = new HistoryTrendsWatcher($historyTrends, $service, config.app.chromeDb)

  chromeHistoryJob.start({
    maxId: await $service.getMaxVisitId()
  })

  setInterval(() => {
    logActivity($service)
  }, 60_000)

  signale.info('🕰 all jobs started')
}

main()

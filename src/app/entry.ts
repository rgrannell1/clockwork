
import config from '../config/default.js'

import { PinboardWatcher } from "../api/pinboard.js"
import { ShellHistoryWatcher } from "../api/shell-history.js"
import { CommonService } from "../store/common-service.js"
import { CodeWatcher } from '../api/code.js'

import * as path from 'path'
import { fileURLToPath } from 'url'
import { HistoryTrendsWatcher } from '../api/history-trends.js'
import { HistoryTrendsService } from '../store/history-trends-service.js'
import signale from 'signale'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const main = async () => {
  signale.info('🕰 starting clockwork')

  const $service = new CommonService(await CommonService.connect('/home/rg'))
  await $service.up()

  const codeFolder = path.join(dirname, '../../..')
  const chromeDbFolder = path.join(dirname, '../../../../.config/google-chrome/Default/databases/chrome-extension_pnmchffiealhkdloeffcdnbgdnedheme_0/10')

  const shellJob = new ShellHistoryWatcher($service, '/home/rg/.zsh_history')
  const pinboardJob = new PinboardWatcher($service, config.pinboard.key)
  const codeJob = new CodeWatcher($service, codeFolder)

  shellJob.start()

  pinboardJob.start({
    time: await $service.getLastUpdate('pinboard')
  })

  codeJob.start({
    time: await $service.getLastUpdate('code')
  })

  const $historyTrends = new HistoryTrendsService(chromeDbFolder)
  const chromeHistoryJob = new HistoryTrendsWatcher($historyTrends, $service, chromeDbFolder)

  chromeHistoryJob.start({
    maxId: await $service.getMaxVisitId()
  })

  setInterval(() => {
    signale.info(`🕰 ${$service.stats.code} code-changes | ${$service.stats.history} shell-history-changes | ${$service.stats.bookmark} bookmark updates | ${$service.stats.web} website visits`)
  }, 60_000)

  signale.info('🕰 all jobs started')
}

main()

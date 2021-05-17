
import config from '../config/default.js'

import { PinboardWatcher } from "../api/pinboard.js"
import { ShellHistoryWatcher } from "../api/shell-history.js"
import { CommonService } from "../store/common-service.js"
import { CodeWatcher } from '../api/code.js'

import * as path from 'path'
import { fileURLToPath } from 'url'
import { HistoryTrendsWatcher } from '../api/history-trends.js'
import { HistoryTrendsService } from '../store/history-trends-service.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const main = async () => {
  const $service = new CommonService(CommonService.connect())
  await $service.up()

  const codeFolder = path.join(dirname, '../../..')
  const chromeDbFolder = path.join(dirname, '../../../../.config/google-chrome/Default/databases/chrome-extension_pnmchffiealhkdloeffcdnbgdnedheme_0/10')

  const shellJob = new ShellHistoryWatcher($service)
  const pinboardJob = new PinboardWatcher($service, config.pinboard.key)
  const codeJob = new CodeWatcher($service, codeFolder)

  shellJob.start()

  pinboardJob.start({
    time: await $service.getLastUpdate('pinboard')
  })

  codeJob.start({
    time: await $service.getLastUpdate('code')
  })


  const $historyTrends = new HistoryTrendsService(HistoryTrendsService.connect(chromeDbFolder))
  const chromeHistoryJob = new HistoryTrendsWatcher($historyTrends, $service, chromeDbFolder)

  chromeHistoryJob.start({
    time: await $service.getLastUpdate('chromeHistory')
  })

}

main()

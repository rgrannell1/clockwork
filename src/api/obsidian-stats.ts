
import * as fs from 'fs'
import fetch from 'node-fetch'
import signale from 'signale'
import { CommonService } from '../store/common-service'

export class ObsidianStatsWatcher {
  $service: CommonService
  pid: any
  key: string
  folder: string

  constructor($service: any, file: string) {
    this.$service = $service
    this.folder = file
  }

  start() {
    this.pid = setInterval(async () => {
      signale.info('🕰 fetching obsidian markdown files.')

      const files = await fs.promises.readdir(this.folder)
      const fileCount = files.filter(file => {
        return file.endsWith('.md')
      }).length

      await this.store({
        fileCount,
        time: Date.now()
      })

    }, 60_000)
  }

  stop() {
    clearInterval(this.pid)
  }

  async store(opts: { fileCount: number, time: number }) {
    await this.$service.writeObsidianStats(opts)
  }
}

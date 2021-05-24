
import fetch from 'node-fetch'
import signale from 'signale'
import { CommonService } from '../store/common-service'

export class TodoistWatcher {
  $service: CommonService
  key: string
  pid: NodeJS.Timeout

  constructor($service: CommonService, key: string) {
    this.$service = $service
    this.key = key
  }

  async start (opts: { time: number }) {
    this.pid = setInterval(async () => {

      signale.info(`🕰 fetching todoist tasks.`)

      const formattedDate = (new Date(opts.time)).toISOString()
      let offset = 0

      let maxTime = opts.time

      while (true) {
        const res = await fetch(`https://api.todoist.com/sync/v8/completed/get_all?token=${this.key}&since=${formattedDate}&offset=${offset}&limit=100`)

        const json = await res.json()
        const { items, projects } = json

        for (const item of items) {
          const time = (new Date(item.completed_date)).getTime()
          const project = projects[item.project_id]?.name
          const task = item.content

          maxTime = Math.max(maxTime, time)

          await this.store({ time, task, project })
        }

        offset += 100
        if (items.length !== 100) {
          break
        }
      }

      await this.$service.setLastUpdate('todoist', maxTime)
    }, 300_000)
  }

  stop () {
    clearInterval(this.pid)
  }

  async store(opts: { time: number, task: string, project: string }) {
    await this.$service.writeTodoistStatus(opts)
  }
}

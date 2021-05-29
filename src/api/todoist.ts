
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

  async start () {
    this.pid = setInterval(async () => {
      const time = await this.$service.getLastUpdate('todoist', 1)

      const formattedDate = (new Date(time)).toISOString()
      signale.info(`🕰 fetching todoist tasks since ${formattedDate}`)
      let offset = 0

      let maxTime = time

      while (true) {
        // -- fetch all completed tasks since a set time. Offset varies with the loop.
        const res = await fetch(`https://api.todoist.com/sync/v8/completed/get_all?token=${this.key}&since=${formattedDate}&offset=${offset}&limit=100`)

        const json = await res.json()
        const { items, projects } = json

        // -- save each item to the db
        for (const item of items) {
          const time = (new Date(item.completed_date)).getTime()
          const project = projects[item.project_id]?.name
          const task = item.content

          maxTime = Math.max(maxTime, time)
          await this.$service.setLastUpdate('todoist', maxTime)

          await this.store({ time, task, project })
        }

        offset += 100
        if (items.length !== 100) {
          break
        }
      }
    }, 300_000)
  }

  stop () {
    clearInterval(this.pid)
  }

  async store(opts: { time: number, task: string, project: string }) {
    await this.$service.writeTodoistStatus(opts)
  }
}

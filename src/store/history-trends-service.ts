
import knex from 'knex'

export class HistoryTrendsService {
  db: any

  constructor(db: any) {
    this.db = db
  }

  static connect (fpath: string) {
    return knex({
      client: 'sqlite3',
      connection: {
        filename: fpath
      }
    })
  }

  async getRows (time: number) {
    return this.db('visits').select('*').where('visit_time', '>', time)
  }

  async watch (lastTime: number, watcher: any) {
    let timestamp = lastTime
    setInterval(async () => {
      const rows = await this.getRows(timestamp)
      await watcher(rows)

      timestamp = Date.now()
    }, 5_000)
  }
}


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

  async getLastRow () {
    const [ result ] = await this.db('visits').count('* as count')
    return result.count
  }

  async getRows (count: number) {
    const result = await this.db('visits').count('* as count')
    const rowCount = result[0].count

    const rows = await this.db('visits').select('*').offset(count)

    return {
      rows,
      rowCount
    }
  }

  async watch (watcher: any) {
    let rowCount = await this.getLastRow()

    setInterval(async () => {
      let data = await this.getRows(rowCount)
      rowCount = data.rowCount

      await watcher(data)
    }, 5_000)
  }
}

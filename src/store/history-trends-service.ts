
import knex from 'knex'

export class HistoryTrendsService {
  db: any
  fpath: string

  constructor (fpath: string) {
    this.fpath = fpath
  }

  static connect (fpath: string) {
    return knex({
      client: 'sqlite3',
      connection: {
        filename: fpath
      },
      useNullAsDefault: true
    })
  }

  async * getRows (maxId: number) {
    // -- todo

    let offset = 50
    let idx = maxId + 1
    while (true) {
      const results = await this.db('visits')
        .select('visits.visit_time as time', 'visits.visitid as visitId', 'urls.root_domain as domain')
        .where('visitId', '>', idx)
        .leftJoin('urls', 'visits.urlid', 'urls.urlid')
        .offset(idx)
        .limit(offset)

      for (const result of results) {
        yield result
      }
      idx += offset

      if (results.length !== 50) {
        return
      }
    }
  }

  async watch (maxId: number, watcher: any) {
    let state = maxId

    setInterval(async () => {
      this.db = HistoryTrendsService.connect(this.fpath)

      for await (const row of this.getRows(maxId)) {
        state = Math.max(state, row.visitId)
        await watcher(row)
      }

      this.db.destroy()

    }, 5_000)
  }

  async close () {

  }
}

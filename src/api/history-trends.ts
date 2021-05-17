
export class HistoryTrendsWatcher {
  fpath: string
  $common: any
  $historyTrends: any

  constructor ($historyTrends: any, $common: any, fpath: string) {
    this.$historyTrends = $historyTrends
    this.$common = $common
    this.fpath = fpath
  }

  start (opts: { time: number }) {
    this.$historyTrends.watch(opts.time, async (data: any) => {
      if (!data || data.length === 0) {
        return
      }

      const mostRecent = data.reduce((left: any, right: any) => {
        return Math.max(left, right.visit_time)
      })

      for (const row of data) {
        await this.store(row.visit_time)
      }

      await this.$common.setLastUpdate('web', mostRecent)
    })
  }

  async stop () {
    return this.$historyTrends.close()
  }

  async store (time: number) {
    return this.$common.writeWebVisit({ time })
  }
}

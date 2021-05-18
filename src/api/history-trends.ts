
export class HistoryTrendsWatcher {
  fpath: string
  $common: any
  $historyTrends: any

  constructor ($historyTrends: any, $common: any, fpath: string) {
    this.$historyTrends = $historyTrends
    this.$common = $common
    this.fpath = fpath
  }

  start (opts: { maxId: number }) {
    this.$historyTrends.watch(opts.maxId, async (row: any) => {
      await this.store(row)
    })
  }

  async stop () {
    return this.$historyTrends.close()
  }

  async store (opts: { time: number, visitId: number, domain: string }) {
    return this.$common.writeWebVisit(opts)
  }
}

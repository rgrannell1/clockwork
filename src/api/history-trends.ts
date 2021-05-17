
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
    this.$historyTrends.watch((data: any) => {
      console.log(data.rows.length)
      console.log(data.rowCount)
      console.log('___________________________________________')
    })
  }

  async stop () {

  }

  async store () {

  }
}

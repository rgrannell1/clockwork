
import signale from 'signale'
import knex from 'knex'
import * as path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export class CommonService {
  db: any

  constructor (db: any) {
    this.db = db
  }

  static connect () {
    return knex({
      client: 'sqlite3',
      connection: {
        filename: path.join(dirname, '../../data/wyd.sqlite')
      }
    })
  }

  async up () {
    if (!await this.db.schema.hasTable('history')) {
      await this.db.schema
        .createTable('history', (table: any) => {
          table.integer('time')
        })
    }

    if (!await this.db.schema.hasTable('pinboard')) {
      await this.db.schema
        .createTable('pinboard', (table: any) => {
          table.integer('time')
        })
    }

    if (!await this.db.schema.hasTable('lastUpdate')) {
      await this.db.schema
        .createTable('lastUpdate', (table: any) => {
          table.integer('time')
          table.string('name')
        })
    }

    if (!await this.db.schema.hasTable('code')) {
      await this.db.schema
        .createTable('code', (table: any) => {
          table.integer('time')
          table.string('project')
        })
    }

    if (!await this.db.schema.hasTable('web')) {
      await this.db.schema
        .createTable('web', (table: any) => {
          table.integer('time')
        })
    }
  }

  async writeCode (opts: { time: number, project: string }) {
    signale.info('write code')
    await this.db.insert({ time: opts.time, project: opts.project }).into('code')
  }

  async writeHistory (opts: { time: number }) {
    signale.info('write history')
    await this.db.insert({ time: opts.time }).into('history')
  }

  async writeBookmark (opts: { time: number }) {
    signale.info('write bookmark')
    await this.db.insert({ time: opts.time }).into('pinboard')
  }

  async writeWebVisit (opts: { time: number }) {
    signale.info('write web-visit')
    await this.db.insert({ time: opts.time }).into('web')
  }

  async getLastUpdate (name: string) {
    return this.db.select().from('lastUpdate').where('name', name) ?? Date.now()
  }

  async setLastUpdate (name: string, time: number) {
    await this.db('lastUpdate').where({name}).del()
    await this.db.insert({ name, time }).into('lastUpdate')
  }
}

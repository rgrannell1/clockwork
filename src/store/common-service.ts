
import * as fs from 'fs'
import signale from 'signale'
import knex from 'knex'
import * as path from 'path'
import { fileURLToPath } from 'url'

const stats = {
  code: 0,
  history: 0,
  bookmark: 0,
  web: 0,
  steam: 0,
  heartbeat: 0,
  twitter: 0,
  todoist: 0,
  notes: 0,
  obsidianStats: 0
}

export class CommonService {
  db: any
  stats = stats

  constructor (db: any) {
    this.db = db
  }

  static async connect (home: string) {
    const folder = path.join(home, 'clockwork')

    try {
      await fs.promises.access(folder, fs.constants.F_OK)
    } catch (err) {
      await fs.promises.mkdir(folder)
    }

    const db = path.join(folder, 'clockwork.sqlite')
    signale.info(`🕰 connecting to ${db}...`)

    return knex({
      client: 'sqlite3',
      connection: {
        filename: db
      },
      useNullAsDefault: true
    })
  }

  async up () {
    signale.info('🕰 creating tables.')

    if (!await this.db.schema.hasTable('history')) {
      signale.info(`creating history table`)

      await this.db.schema
        .createTable('history', (table: any) => {
          table.integer('time')
        })
    }

    if (!await this.db.schema.hasTable('pinboard')) {
      signale.info(`creating pinboard table`)

      await this.db.schema
        .createTable('pinboard', (table: any) => {
          table.integer('time')
        })
    }

    if (!await this.db.schema.hasTable('lastUpdate')) {
      signale.info(`creating lastUpdate table`)

      await this.db.schema
        .createTable('lastUpdate', (table: any) => {
          table.integer('time')
          table.string('name')
        })
    }

    if (!await this.db.schema.hasTable('code')) {
      signale.info(`creating code table`)

      await this.db.schema
        .createTable('code', (table: any) => {
          table.integer('time')
          table.string('file')
          table.string('project')
        })
    }

    if (!await this.db.schema.hasTable('notes')) {
      signale.info(`creating notes table`)

      await this.db.schema
        .createTable('notes', (table: any) => {
          table.integer('time')
        })
    }

    if (!await this.db.schema.hasTable('web')) {
      signale.info(`creating web table`)

      await this.db.schema
        .createTable('web', (table: any) => {
          table.integer('time')
          table.integer('visitId')
          table.string('domain')
        })
    }

    if (!await this.db.schema.hasTable('steam')) {
      signale.info(`creating steam table`)

      await this.db.schema
        .createTable('steam', (table: any) => {
          table.integer('time')
          table.string('game')
        })
    }

    if (!await this.db.schema.hasTable('heartbeat')) {
      signale.info(`creating heartbeat table`)

      await this.db.schema
        .createTable('heartbeat', (table: any) => {
          table.integer('time')
        })
    }

    if (!await this.db.schema.hasTable('twitter')) {
      signale.info(`creating twitter table`)

      await this.db.schema
        .createTable('twitter', (table: any) => {
          table.integer('time')
        })
    }

    if (!await this.db.schema.hasTable('todoist')) {
      signale.info(`creating todoist table`)

      await this.db.schema
        .createTable('todoist', (table: any) => {
          table.integer('time')
          table.string('project')
          table.string('task')
        })
    }

    if (!await this.db.schema.hasTable('obsidian_stats')) {
      signale.info(`creating obsidian_stats table`)

      await this.db.schema
        .createTable('obsidian_stats', (table: any) => {
          table.integer('fileCount')
          table.integer('time')
        })
    }
  }

  async getMaxVisitId () {
    const result = await this.db('web').max('visitId as max')
    const [{ max }] = result

    return max ?? 0
  }

  async writeCode (opts: { time: number, file: string, project: string }) {
    await this.db.insert(opts).into('code')
    stats.code++
  }

  async writeNotes (opts: { time: number}) {
    await this.db.insert(opts).into('notes')
    stats.notes++
  }

  async writeHistory (opts: { time: number }) {
    await this.db.insert({ time: opts.time }).into('history')
    stats.history++
  }

  async writeBookmark (opts: { time: number }) {
    await this.db.insert({ time: opts.time }).into('pinboard')
    stats.bookmark++
  }

  async writeWebVisit (opts: { time: number, visitId: number, domain: string }) {
    await this.db('web').where('visitId', opts.visitId).del()
    await this.db.insert(opts).into('web')
    stats.web++
  }

  async writeSteamStatus (opts: { time: number, game: string }) {
    await this.db.insert(opts).into('steam')
    stats.steam++
  }

  async writeHeartbeatStatus (opts: { time: number }) {
    await this.db.insert(opts).into('heartbeat')
    stats.heartbeat++
  }

  async writeTweet (opts: { time: number }) {
    await this.db.insert(opts).into('twitter')
    stats.twitter++
  }

  async writeTodoistStatus (opts: { time: number }) {
    await this.db.insert(opts).into('todoist')
    stats.todoist++
  }

  async getLastUpdate (name: string, fallback?: number) {
    const [match] = await this.db.select().from('lastUpdate').where('name', name)

    if (!match && fallback) {
      signale.debug(`🕰 no last update found for ${name}, returning fallback`)
      return fallback
    } else if (!match) {
      signale.debug(`🕰 no last update found for ${name}, returning current date`)
      return Date.now()
    }

    return match.time
  }

  async writeObsidianStats (opts: {fileCount: number, time: number}) {
   await this.db.insert(opts).into('obsidian_stats')
   stats.obsidianStats++
  }

  async setLastUpdate (name: string, time: number) {
    await this.db('lastUpdate').where({name}).del()
    await this.db.insert({ name, time }).into('lastUpdate')
  }
}

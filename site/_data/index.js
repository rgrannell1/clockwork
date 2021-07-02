
const sqlite = require('sqlite3')

const db = fpath => {
  const sqlite3 = sqlite.verbose()
  return new sqlite3.Database(fpath)
}

const codingAllTime = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT project, count(project) as updates, strftime("%Y-%m-%d", time / 1000, 'unixepoch') as day
      from code
      where code.project IS NOT NULL
      group by project, day`

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const codingByProject = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT project, count(project) as updates
      from code
      where code.project IS NOT NULL
      group by project`

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const shellHistoryAllTime = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT count(*) as updates, strftime("%Y-%m-%d", time / 1000, 'unixepoch') as day from history group by day`

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const todoistAllTime = async conn => {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT project, count(project) as updates, strftime("%Y-%m-%d", time / 1000, 'unixepoch') as day
      from todoist
      group by project, day`

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const todoistByProject = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT project, count(project) as updates
      from todoist
      group by project`

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const todoistThisYear = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT count(*) as updates, project, strftime("%Y-%m-%d", time / 1000, 'unixepoch') as day
    from todoist
      where day >= date('now', '-1 year')
    group by day`

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const todoistThisMonth = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT count(*) as updates, project, strftime("%Y-%m-%d", time / 1000, 'unixepoch') as day
    from todoist
      where day >= date('now', '-1 month')
    group by day
    `

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const gamingAllTime = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT count(*) as updates, game, strftime("%Y-%m-%d", time / 1000, 'unixepoch') as day
    from steam
    group by day
    `

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

const notesAllTime = async conn => {
  return new Promise((resolve, reject) => {
    const query = `SELECT count(*) as updates, strftime("%Y-%m-%d", time / 1000, 'unixepoch') as day
    from notes
    group by day
    `

    conn.all(query, (err, rows) => {
      err ? reject(err) : resolve(rows)
    })
  })
}

module.exports = async () => {
  const conn = db('/home/rg/clockwork/clockwork.sqlite')

  const data = {
    codingAllTime: await codingAllTime(conn),
    codingByProject: await codingByProject(conn),
    shellHistoryAllTime: await shellHistoryAllTime(conn),
    todoistAllTime: await todoistAllTime(conn),
    todoistByProject: await todoistByProject(conn),
    todoistThisYear: await todoistThisYear(conn),
    todoistThisMonth: await todoistThisMonth(conn),
    gamingAllTime: await gamingAllTime(conn),
    notesAllTime: await notesAllTime(conn),
  }

  return data
}

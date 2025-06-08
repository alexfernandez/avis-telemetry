import Database from 'better-sqlite3'

const db = initDb()


function initDb() {
	const config = process.env['BACKEND_SQLITE_DB'] || 'local.db'
	const db = new Database(config, {})
	db.pragma('journal_mode = WAL')
	return db
}

export function createTable(table, fields) {
	const defs = [Object.keys(fields).map(key => `'${key}' ${fields[key]}`)]
	const createTable = `CREATE TABLE IF NOT EXISTS ${table} (${defs})`
	db.exec(createTable)
}

export function insertRegister(table, data) {
	const insert = generateInsert(table, Object.keys(data))
	db.prepare(insert).run(data)
}

function generateInsert(table, keys) {
	const placeholders = keys.map(key => `@${key}`)
	return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`
}

export function findLatest(table, where, order) {
	const select = getSelect(table, Object.keys(where), order)
	const results = db.prepare(select).get(Object.values(where))
	return results
}

function getSelect(table, where, order) {
	const orderClause = order ? `ORDER BY ${order}` : ''
	return `SELECT * FROM ${table} WHERE ${where.join(' AND ')} ${orderClause}`
}

export function findGrouped(table, conditions, group, limit = 10) {
	const where = Object.keys(conditions)
	const select = getSelectGroup('measures', where, group, limit)
	return db.prepare(select).all(Object.values(conditions))
}

function getSelectGroup(table, where, group, limit) {
	const groupClause = group ? `GROUP BY ${group}` : ''
	const limitClause = `ORDER BY total DESC LIMIT ${limit}`
	return `SELECT ${group}, count(*) as total FROM ${table} WHERE ${where.join(' AND ')} ${groupClause} ${limitClause}`
}

export function dropTable(table) {
	const dropTable = `DROP TABLE IF EXISTS ${table}`
	db.exec(dropTable)
}

export function close() {
	db.close()
}


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

export function addConfigSource() {
	const alterTable = `ALTER TABLE configs ADD COLUMN source TEXT NOT NULL DEFAULT '-'`
	db.exec(alterTable)
}

export function insertRegister(table, message) {
	const insert = generateInsert(table, Object.keys(message))
	db.prepare(insert).run(message)
}

function generateInsert(table, keys) {
	const placeholders = keys.map(key => `@${key}`)
	return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`
}

export function findLatest(table, where, order) {
	const select = getSelect(table, Object.keys(where), order)
	const values = Object.values(where)
	const results = db.prepare(select).get(values)
	return results
}

export function findLastRecords(table, where, order, limit) {
	const select = getSelect(table, Object.keys(where), order, limit)
	const values = [...Object.values(where), limit]
	const results = db.prepare(select).all(values)
	return results
}

function getSelect(table, where, order, limit) {
	const limitClause = order ? `ORDER BY ${order}` : ''
	const orderClause = limit ? `LIMIT ?` : ''
	return `SELECT * FROM ${table} WHERE ${where.join(' AND ')} ${limitClause} ${orderClause}`
}

export function findGrouped(table, conditions, group, limit = 10) {
	const where = Object.keys(conditions)
	const select = getSelectGroup('measures', where, group, limit)
	const values = [...Object.values(conditions), group, limit]
	return db.prepare(select).all(values)
}

function getSelectGroup(table, where, group, limit) {
	const groupClause = group ? `GROUP BY ?` : ''
	const limitClause = limit ? `ORDER BY total DESC LIMIT ?` : ''
	return `SELECT ${group}, count(*) as total FROM ${table} WHERE ${where.join(' AND ')} ${groupClause} ${limitClause}`
}

export function dropTable(table) {
	const dropTable = `DROP TABLE IF EXISTS ${table}`
	db.exec(dropTable)
}

export function close() {
	db.close()
}


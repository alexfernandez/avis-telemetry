import Database from 'better-sqlite3'
import randomUUID from 'crypto'


const db = initDb()


function initDb() {
	const config = process.env['BACKEND_SQLITE_DB'] || 'local.db'
	const db = new Database(config, {})
	db.pragma('journal_mode = WAL')
	return db
}

export function createTables() {
	const measureFields = {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		measure: 'JSON NOT NULL',
		createdAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
		takenAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
	}
	createTable('measures', measureFields)
	const configFields = {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		measure: 'JSON NOT NULL',
		createdAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
	}
	createTable('configs', configFields)
}

function createTable(table, fields) {
	const defs = [Object.keys(fields).map(key => `'${key}' ${fields[key]}`)]
	const createTable = `CREATE TABLE IF NOT EXISTS ${table} (${defs})`
	console.log(createTable)
	db.exec(createTable)
}

export function insertMeasure(device, measure, takenAt) {
	const data = {
		id: randomUUID(),
		device,
		measure,
		takenAt,
	}
	const insert = generateInsert('measures', data)
	db.prepare(insert).run(Object.values(data))
}

function generateInsert(table, keys) {
	const placeholders = keys.map(key => `@${key}`)
	return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`
}

export function findLatestMeasure(device) {
	const select = getSelect('measures', [`device = ?`], 'takenAt DESC')
	const results = db.prepare(select).get([device])
	return results
}

function getSelect(table, where, order) {
	const orderClause = order ? `ORDER BY ${order}` : ''
	return `SELECT * FROM ${table} WHERE ${where.join(' AND ')} ${orderClause}`
}

export function findConfig(device) {
	const select = getSelect('measures', [`device = ?`], 'createdAt DESC')
	const results = db.prepare(select).get([device])
	return results
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


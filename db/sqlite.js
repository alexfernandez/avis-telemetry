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
		id: 'integer',
		device: 'varchar',
		measure: 'json',
		createdAt: 'date',
		takenAt: 'date',
	}
	createTable('measures', measureFields)
	const configFields = {
		id: 'integer',
		device: 'varchar',
		measure: 'json',
		createdAt: 'date',
	}
	createTable('configs', configFields)
}

function createTable(name, fields) {
	const defs = [Object.keys(fields).map(key => `'${key}' ${fields[key]}`)]
	const createTable = `CREATE TABLE IF NOT EXISTS ${name} (${defs}), PRIMARY KEY(id)`
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

function generateInsert(name, keys) {
	const placeholders = keys.map(key => `@${key}`)
	return `INSERT INTO ${name} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`
}

export function findLatestMeasure(device) {
	const select = getSelect('measures', [`device = ?`], 'takenAt DESC')
	const results = db.prepare(select).get([device])
	return results
}

function getSelect(name, conditions, order) {
	return `SELECT * FROM ${name} WHERE ${conditions.join(' AND ')} ORDER BY ${order}`
}

export function findConfig(device) {
	const select = getSelect('measures', [`device = ?`], 'createdAt DESC')
	const results = db.prepare(select).get([device])
	return results
}

export function dropTable(name) {
	const dropTable = `DROP TABLE IF EXISTS ${name}`
	db.exec(dropTable)
}

export function close() {
	db.close()
}


import {
	createTable, insertRegister, findLatest, findLastRecords,
} from './sqlite.js'

const maxLimit = 100


init()

function init() {
	createTable('measures', {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		source: 'TEXT NOT NULL',
		measure: 'JSON NOT NULL',
		createdAt: "DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))",
		takenAt: "DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))",
	})
	createTable('configs', {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		config: 'JSON NOT NULL',
		source: 'TEXT NOT NULL',
		createdAt: "DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))",
	})
}

export function storeMeasure(message) {
	return insertRegister('measures', message)
}

export function readLatestMeasure(device) {
	const latest = findLatest('measures', {'device = ?': device}, 'takenAt DESC')
	if (!latest) {
		return null
	}
	latest.measure = JSON.parse(latest.measure)
	return latest
}

export function readLastMeasures(device, limit) {
	if (!limit) {
		return []
	}
	if (limit > maxLimit) {
		throw new Error(`Too many measures requested, max ${maxLimit}`)
	}
	const records = findLastRecords('measures', {'device = ?': device}, 'takenAt DESC', limit)
	if (!records?.length) {
		return []
	}
	for (const record of records) {
		record.measure = JSON.parse(record.measure)
	}
	return records
}

export function storeConfig(config) {
	return insertRegister('configs', config)
}

export function readConfig(device) {
	const latest = findLatest('configs', {'device = ?': device}, 'createdAt DESC')
	if (!latest) {
		return null
	}
	latest.config = JSON.parse(latest.config)
	return latest
}


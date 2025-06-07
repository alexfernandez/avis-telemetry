import {randomUUID} from 'crypto'
import {createTable, insertRegister, findLatest} from './sqlite.js'

init()


function init() {
	createTable('measures', {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		measure: 'JSON NOT NULL',
		createdAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
		takenAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
	})
	createTable('configs', {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		measure: 'JSON NOT NULL',
		createdAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
	})
}

export function createTables() {
}

export function storeMeasure(device, measure, takenAt) {
	const data = {
		id: randomUUID(),
		device,
		measure: JSON.stringify(measure),
		takenAt,
	}
	return insertRegister('measures', data)
}

export function readLatestMeasure(device) {
	return findLatest('measures', {'device = ?': device}, 'takenAt DESC')
}

export function storeConfig(device, config) {
	const data = {
		id: randomUUID(),
		device,
		config: JSON.stringify(config),
	}
	return insertRegister('config', data)
}

export function readConfig(device) {
	return findLatest('config', {'device = ?': device}, 'createdAt DESC')
}


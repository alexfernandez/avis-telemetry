import {
	createTable, insertRegister, findLatest, findLastRecords,
} from './sqlite.js'

import {sizeLimit, maxMeasureLimit} from '../core/config.js'


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

export function storeMeasure(measure) {
	const serialized = {
		...measure,
		measure: serialize(measure.measure)
	}
	return insertRegister('measures', serialized)
}

function serialize(measure) {
	const serialized = JSON.stringify(measure)
	if (serialized.length > sizeLimit) {
		throw new Error(`Size ${serialized.length} is above the current limit of ${sizeLimit}`)
	}
	return serialized
}

export function readLatestMeasure(device) {
	const latest = findLatest('measures', {'device = ?': device}, 'takenAt DESC')
	if (!latest) {
		return null
	}
	return convertMeasure(latest)
}

export function readLastMeasures(device, limit) {
	if (!limit) {
		return []
	}
	if (limit > maxMeasureLimit) {
		throw new Error(`Too many measures requested, max ${maxMeasureLimit}`)
	}
	const records = findLastRecords('measures', {'device = ?': device}, 'takenAt DESC', limit)
	if (!records?.length) {
		return []
	}
	return records.map(convertMeasure)
}

function convertMeasure(record) {
	return {
		...record,
		takenAt: new Date(record.takenAt + 'Z').toISOString(),
		createdAt: new Date(record.createdAt + 'Z').toISOString(),
		measure: JSON.parse(record.measure),
	}
}

export function storeConfig(config) {
	const serialized = {
		...config,
		config: serialize(config.config)
	}
	return insertRegister('configs', serialized)
}

export function readConfig(device) {
	const latest = findLatest('configs', {'device = ?': device}, 'createdAt DESC')
	if (!latest) {
		return null
	}
	latest.config = JSON.parse(latest.config)
	return latest
}


import {
	createTable, alterTable,
	insertRegister, findLatest, findLastRecords,
} from './sqlite.js'

import {sizeLimit, maxMeasureLimit} from '../core/config.js'


init()

function init() {
	createTable('measures', {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		source: 'TEXT NOT NULL',
		measure: 'JSON NOT NULL',
		secret: 'TEXT',
		createdAt: "DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))",
		takenAt: "DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))",
	})
	createTable('configs', {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
		source: 'TEXT NOT NULL',
		config: 'JSON NOT NULL',
		secret: 'TEXT',
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
		id: record.id,
		device: record.device,
		source: record.source,
		takenAt: convertDate(record.takenAt),
		createdAt: convertDate(record.createdAt),
		measure: JSON.parse(record.measure),
	}
}

function convertDate(date) {
	if (!date) {
		return null
	}
	if (date.endsWith('Z')) {
		return date
	}
	return new Date(date + 'Z').toISOString()
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
	return convertConfig(latest)
}

function convertConfig(record) {
	return {
		id: record.id,
		device: record.device,
		source: record.source,
		createdAt: convertDate(record.createdAt),
		config: JSON.parse(record.config),
	}
}

export function addConfigSource() {
	alterTable('configs', `source TEXT NOT NULL DEFAULT '-'`)
}

export function addSecrets() {
	alterTable('measures', 'secret TEXT')
	alterTable('configs', 'secret TEXT')
}


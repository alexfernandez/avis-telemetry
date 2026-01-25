import {randomUUID} from 'crypto'
import {
	createTable, insertRegister, findLatest, findLastRecords,
} from './sqlite.js'
import {maxDeviceLength, minDelayMs, sizeLimit} from '../core/config.js'

const latestMeasure = new Map()
const latestConfig = new Map()
const maxLimit = 100
let configuredMinDelayMs = minDelayMs
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
		createdAt: "DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))",
	})
}

export function storeMeasure(device, measure, takenAt, source) {
	checkMeasure(device)
	const message = {
		id: randomUUID(),
		device,
		measure: serialize(measure),
		source,
	}
	if (takenAt) {
		message.takenAt = takenAt
	}
	return insertRegister('measures', message)
}

function checkMeasure(device) {
	checkLatest(device, latestMeasure)
}

function checkLatest(device, map) {
	if (!device) {
		throw new Error('Missing device code')
	}
	if (device.length >= maxDeviceLength) {
		throw new Error(`Device code too long, should be under ${maxDeviceLength} characters`)
	}
	const nowMs = Date.now()
	const latestMs = map.get(device)
	const diffMs = nowMs - latestMs
	if (nowMs - latestMs < configuredMinDelayMs) {
		throw new Error(`Delay between writes ${diffMs} ms was too short; should be at least ${configuredMinDelayMs} ms`)
	}
	map.set(device, nowMs)
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

export function storeConfig(device, config, source) {
	checkConfig(device)
	const message = {
		id: randomUUID(),
		device,
		config: serialize(config),
		source,
	}
	return insertRegister('configs', message)
}

function checkConfig(device) {
	checkLatest(device, latestConfig)
}

export function readConfig(device) {
	const latest = findLatest('configs', {'device = ?': device}, 'createdAt DESC')
	if (!latest) {
		return null
	}
	latest.config = JSON.parse(latest.config)
	return latest
}

export function setMinDelayMs(testMinDelayMs) {
	configuredMinDelayMs = testMinDelayMs
}


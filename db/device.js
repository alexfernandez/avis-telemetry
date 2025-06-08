import {randomUUID} from 'crypto'
import {createTable, insertRegister, findLatest} from './sqlite.js'
import config from '../core/config.js'

const latestMeasure = new Map()
const latestConfig = new Map()
init()


function init() {
	createTable('measures', {
		id: 'TEXT PRIMARY KEY',
		device: 'TEXT NOT NULL',
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

export function storeMeasure(device, measure, takenAt) {
	checkMeasure(device)
	const message = {
		id: randomUUID(),
		device,
		measure: serialize(measure),
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
	if (device.length >= config.maxDeviceLength) {
		throw new Error(`Device code too long, should be under ${config.maxDeviceLength} characters`)
	}
	const nowMs = Date.now()
	const latestMs = map.get(device)
	const diffMs = nowMs - latestMs
	if (nowMs - latestMs < config.minDelayMs) {
		throw new Error(`Delay between writes ${diffMs} ms was too short; should be at least ${config.minDelayMs} ms`)
	}
	map.set(device, nowMs)
}

function serialize(measure) {
	const serialized = JSON.stringify(measure)
	if (serialized.length > config.sizeLimit) {
		throw new Error(`Size ${serialized.length} is above the current limit of ${config.sizeLimit}`)
	}
	return serialized
}

export function readLatestMeasure(device) {
	return findLatest('measures', {'device = ?': device}, 'takenAt DESC, createdAt DESC')
}

export function storeConfig(device, config) {
	checkConfig(device)
	const message = {
		id: randomUUID(),
		device,
		config: serialize(config),
	}
	return insertRegister('configs', message)
}

function checkConfig(device) {
	checkLatest(device, latestConfig)
}

export function readConfig(device) {
	return findLatest('configs', {'device = ?': device}, 'createdAt DESC')
}


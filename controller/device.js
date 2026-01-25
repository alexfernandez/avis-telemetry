import {randomUUID} from 'crypto'
import {
	storeMeasure, storeConfig,
} from '../db/device.js'
import {maxDeviceLength, minDelayMs, sizeLimit} from '../core/config.js'
import {sendMeasure} from '../server/websocket.js'

const latestMeasure = new Map()
const latestConfig = new Map()
let configuredMinDelayMs = minDelayMs


export async function processMeasure(device, measure, takenAt, source) {
	const message = buildMeasure(device, measure, takenAt, source)
	storeMeasure(message)
	await sendMeasure(message)
}

function buildMeasure(device, measure, takenAt, source) {
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
	return message
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

export async function processConfig(device, config, source) {
	checkConfig(device)
	const message = {
		id: randomUUID(),
		device,
		config: serialize(config), // E: 'serialize' is not defined.
		source,
	}
	storeConfig(message)
}

function checkConfig(device) {
	checkLatest(device, latestConfig)
}

export function setMinDelayMs(testMinDelayMs) {
	configuredMinDelayMs = testMinDelayMs
}


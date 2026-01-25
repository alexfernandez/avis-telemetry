import {randomUUID} from 'crypto'
import {
	storeMeasure, storeConfig,
} from '../db/device.js'
import {maxDeviceLength, minDelayMs} from '../core/config.js'
import {sendMeasure} from '../server/websocket.js'

const latestMeasure = new Map()
const latestConfig = new Map()
let configuredMinDelayMs = minDelayMs


export async function processMeasure(measure) {
	const message = buildMeasure(measure)
	storeMeasure(message)
	await sendMeasure({
		...message,
		takenAt: measure.takenAt || new Date(),
	})
}

function buildMeasure({device, measure, takenAt, secret, source}) {
	checkMeasure(device)
	const message = {
		id: randomUUID(),
		device,
		measure,
		source,
		secret,
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

export async function processConfig({device, source, secret, config}) {
	checkConfig(device, secret)
	const message = {
		id: randomUUID(),
		device,
		source,
		secret,
		config,
	}
	storeConfig(message)
}

function checkConfig(device) {
	checkLatest(device, latestConfig)
}

export function setMinDelayMs(testMinDelayMs) {
	configuredMinDelayMs = testMinDelayMs
}


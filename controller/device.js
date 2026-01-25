import {randomUUID} from 'crypto'
import {
	storeMeasure, storeConfig,
	findLatestMeasure, findLatestConfig,
	convertDate,
} from '../db/device.js'
import {maxDeviceLength, minDelayMs} from '../core/config.js'
import {sendMeasure} from '../server/websocket.js'

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
	checkLatest(device, secret, findLatestMeasure)
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

function checkLatest(device, secret, findLatestRecord) {
	if (!device) {
		throw new Error('Missing device code')
	}
	if (device.length >= maxDeviceLength) {
		throw new Error(`Device code too long, should be under ${maxDeviceLength} characters`)
	}
	const latest = findLatestRecord(device)
	if (!latest) {
		return
	}
	const latestMs = convertDate(latest.createdAt).getTime()
	const nowMs = Date.now()
	const diffMs = nowMs - latestMs
	if (nowMs - latestMs < configuredMinDelayMs) {
		throw new Error(`Delay between writes ${diffMs} ms was too short; should be at least ${configuredMinDelayMs} ms`)
	}
	if (!latest.secret) {
		return
	}
	if (secret != latest.secret) {
		throw new Error(`Secrets don't match`)
	}
}

export async function processConfig({device, source, secret, config}) {
	checkLatest(device, secret, findLatestConfig)
	const message = {
		id: randomUUID(),
		device,
		source,
		secret,
		config,
	}
	storeConfig(message)
}

export function setMinDelayMs(testMinDelayMs) {
	configuredMinDelayMs = testMinDelayMs
}


import {
	readLatestMeasure, readLastMeasures, readConfig,
} from '../db/device.js'
import {createDevicePage} from '../page/device.js'
import {processMeasure, processConfig} from '../controller/device.js'

const defaultLimit = 10


export default async function setup(app) {
	app.get('/show/:device', serveDevicePage)
	app.post('/devices/:device/measures', postMeasure)
	app.get('/devices/:device/measures/latest', getLatestMeasure)
	app.get('/devices/:device/measures', getLastMeasures)
	app.put('/devices/:device/config', putConfig)
	app.get('/devices/:device/config', getConfig)
}

async function serveDevicePage(request, reply) {
	reply.type('text/html')
	return createDevicePage(request.params.device)
}

async function postMeasure(request, reply) {
	try {
		const {device, ip} = readFromRequest(request)
		request.log.info(`Received measure from ${ip} for device ${device}`)
		const {takenAt, secret, ...measure} = request.body
		await processMeasure({device, source: `post ${ip}`, takenAt, secret, measure})
		return {ok: true}
	} catch(error) {
		request.log.warn(error.stack)
		reply.status(400)
		return {error: error.message}
	}
}

async function getLatestMeasure(request) {
	const {device} = request.params
	return readLatestMeasure(device)
}

async function getLastMeasures(request, reply) {
	try {
		const {device} = request.params
		const {limit} = request.query
		const intLimit = parseInt(limit) || defaultLimit
		return readLastMeasures(device, intLimit)
	} catch(error) {
		// console.error(error.stack)
		reply.status(400)
		return {error: error.message}
	}
}

async function putConfig(request, reply) {
	try {
		const {device, ip} = readFromRequest(request)
		request.log.info(`Received config from ${ip} for device ${device}`)
		const {secret, ...config} = request.body
		await processConfig({device, source: `post ${ip}`, secret, config})
		return {ok: true}
	} catch(error) {
		// console.error(error.stack)
		reply.status(400)
		return {error: error.message}
	}
}

function readFromRequest(request) {
	const {device} = request.params
	const ip = request.headers['x-real-ip'] || request.ip
	return {device, ip}
}

async function getConfig(request) {
	const {device} = request.params
	const record = readConfig(device)
	return record?.config
}


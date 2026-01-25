import {
	readLatestMeasure, readLastMeasures,
	storeConfig, readConfig,
} from '../db/device.js'
import {createDevicePage} from '../page/device.js'
import {processMeasure} from './measure.js'


export default async function setup(app) {
	app.get('/show/:device', serveDevicePage)
	app.post('/devices/:device/measures', postMeasure)
	app.get('/devices/:device/measures/latest', getLatestMeasure)
	app.get('/devices/:device/measures/last/:limit', getLastMeasures)
	app.put('/devices/:device/config', putConfig)
	app.get('/devices/:device/config', getConfig)
}

async function serveDevicePage(request, reply) {
	reply.type('text/html')
	return createDevicePage(request.params.device)
}

async function postMeasure(request, reply) {
	try {
		const {device} = request.params
		request.log.info(`Received http message from ${request.ip} for device ${device}`)
		const {takenAt, ...measure} = request.body
		await processMeasure(device, measure, takenAt, `post ${request.ip}`)
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
		const {device, limit} = request.params
		const intLimit = parseInt(limit)
		return readLastMeasures(device, intLimit)
	} catch(error) {
		// console.error(error.stack)
		reply.status(400)
		return {error: error.message}
	}
}

async function putConfig(request, reply) {
	try {
		const {device} = request.params
		storeConfig(device, request.body, `post ${request.ip}`)
		return {ok: true}
	} catch(error) {
		// console.error(error.stack)
		reply.status(400)
		return {error: error.message}
	}
}

async function getConfig(request) {
	const {device} = request.params
	const record = readConfig(device)
	return record?.config
}


import {storeMeasure, readLatestMeasure, storeConfig, readConfig} from '../db/device.js'


export default async function setup(app) {
	app.post('/devices/:device/measures', postMeasure)
	app.get('/devices/:device/measures/latest', getLatestMeasure)
	app.put('/devices/:device/config', putConfig)
	app.get('/devices/:device/config', getConfig)
}

async function postMeasure(request, reply) {
	try {
		const {device} = request.params
		const {takenAt, ...measure} = request.body
		storeMeasure(device, measure, takenAt)
		return {ok: true}
	} catch(error) {
		reply.status(400)
		return {error: error.message}
	}
}

async function getLatestMeasure(request) {
	const {device} = request.params
	const record = readLatestMeasure(device)
	record.measure = JSON.parse(record.measure)
	return record
}

async function putConfig(request) {
	const {device} = request.params
	storeConfig(device, request.body)
	return {ok: true}
}

async function getConfig(request) {
	const {device} = request.params
	const record = readConfig(device)
	return JSON.parse(record.config)
}


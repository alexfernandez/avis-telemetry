import {storeMeasure, readLatestMeasure, storeConfig, readConfig} from '../db/device.js'


export default async function setup(app) {
	app.post('/devices/:device/measures', postMeasure)
	app.get('/devices/:device/measures/latest', getLatestMeasure)
	app.put('/devices/:device/config', putConfig)
	app.get('/devices/:device/config', getConfig)
}

async function postMeasure(request) {
	const {device} = request.params
	const {takenAt, ...measure} = request.body
	storeMeasure(device, measure, takenAt)
	return {ok: true}
}

async function getLatestMeasure(request) {
	const {device} = request.params
	return readLatestMeasure(device)
}

async function putConfig(request) {
	const {device} = request.params
	storeConfig(device, request.body)
	return {ok: true}
}

async function getConfig(request) {
	const {device} = request.params
	return readConfig(device)
}


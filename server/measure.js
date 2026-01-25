import {
	buildMeasure, storeMeasure,
} from '../db/device.js'
import {sendMeasure} from './websocket.js'


export async function processMeasure(device, measure, takenAt, source) {
	const message = buildMeasure(device, measure, takenAt, source)
	storeMeasure(message)
	await sendMeasure(message)
}




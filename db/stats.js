import {findGrouped} from './sqlite.js'
import {} from './device.js'


export function readLatestDevices() {
	const day = getDay()
	return findGrouped('measures', {'DATE(createdAt) = ?': day}, 'device')
}

export function getDay(diff) {
	const date = new Date()
	if (diff) {
		date.setDate(date.getDate() + diff)
	}
	return date.toISOString().substring(0, 10)
}


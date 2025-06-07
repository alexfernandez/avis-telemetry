import {createTables, findGrouped} from './sqlite.js'


init()

function init() {
	createTables()
}

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


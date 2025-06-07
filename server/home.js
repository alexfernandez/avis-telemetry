import {readLatestDevices} from '../db/stats.js'
import {createHome} from '../page/home.js'


export default async function setup(app) {
	app.get('/', serveHome)
}

async function serveHome(request, reply) {
	const latestDevices = readLatestDevices()
	reply.type('text/html')
	return createHome(latestDevices)
}


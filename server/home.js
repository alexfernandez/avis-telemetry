import {serveStaticFile} from './file.js'
import {readLatestDevices} from '../db/stats.js'
import {createHome} from '../page/home.js'


export default async function setup(app) {
	app.get('/', serveHome)
	app.get('/main.css', await serveFile('public/main.css', 'text/css'))
	app.get('/favicon.ico', await serveFile('public/favicon.png', 'image/png'))
	app.get('/favicon.png', await serveFile('public/favicon.png', 'image/png'))
	app.get('/logo.svg', await serveFile('public/logo.svg', 'image/svg+xml'))
}

async function serveHome(request, reply) {
	const latestDevices = readLatestDevices()
	reply.type('text/html')
	return createHome(latestDevices)
}

async function serveFile(path, mime) {
	return async function(request, reply) {
		return serveStaticFile(path, mime, request, reply)
	}
}


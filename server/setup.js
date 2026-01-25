import websocket from '@fastify/websocket'
import homePlugin from './home.js'
import devicePlugin from './device.js'
import websocketPlugin from './websocket.js'
import {UdpServer} from './udp.js'


export async function setup(app) {
	await app.register(websocket)
	app.register(homePlugin)
	app.register(devicePlugin)
	app.register(websocketPlugin)
	app.log.info('plugins loaded')
	return app
}

export async function setupUdp(app) {
	const server = new UdpServer(app.log)
	await server.start()
	return server
}


import homePlugin from './home.js'
import devicePlugin from './device.js'
import websocketPlugin from './websocket.js'


export default function setup(app) {
	app.register(homePlugin)
	app.register(devicePlugin)
	app.register(websocketPlugin)
	app.log.info('plugins loaded')
	return app
}


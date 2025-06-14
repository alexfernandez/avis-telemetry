import homePlugin from './home.js'
import devicePlugin from './device.js'


export default function setup(app) {
	app.register(homePlugin)
	app.register(devicePlugin)
	app.log.info('plugins loaded')
	return app
}


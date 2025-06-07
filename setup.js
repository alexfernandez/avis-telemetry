import homePlugin from './server/home.js'
import devicePlugin from './server/device.js'


export default function setup(app) {
	app.register(homePlugin)
	app.register(devicePlugin)
	app.log.info('plugins loaded')
	return app
}


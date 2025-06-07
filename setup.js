import homePlugin from './server/home.js'


export default function setup(app) {
	app.register(homePlugin)
	app.log.info('plugins loaded')
	return app
}


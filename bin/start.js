import Fastify from 'fastify'
import setup from '../setup.js'


async function start() {
	const app = Fastify({
		logger: {
			level: 'info',
		},
	})
	try {
		await setup(app)
		await app.listen({port: 4215, host: '0.0.0.0'})
	} catch (error) {
		app.log.error(error)
		process.exit(1)
	}
}

start()


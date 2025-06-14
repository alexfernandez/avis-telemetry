import Fastify from 'fastify'
import {port} from '../core/config.js'
import setup from '../server/setup.js'
import {UdpServer} from '../server/udp.js'


async function start() {
	const app = Fastify({
		logger: {
			level: 'info',
		},
	})
	console.log(app.log)
	const server = new UdpServer(app.log)
	try {
		await setup(app)
		await app.listen({port, host: '0.0.0.0'})
		await server.start()
	} catch (error) {
		app.log.error(error)
		process.exit(1)
	}
}

start()


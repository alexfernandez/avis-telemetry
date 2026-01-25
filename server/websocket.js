import FastifyWebSocket from '@fastify/websocket'

const listenersPerDevice = new Map()


export default async function setup(app) {
	app.register(FastifyWebSocket)
	app.get('/sync/:device', {websocket: true}, sync)
}

async function sync(socket, request) {
	const device = request.params.device
	request.log.info(`New listener for ${device} on ${request.ip}`)
	const listeners = listenersPerDevice.get(device) || []
	listeners.push(socket)
}

export async function sendMeasure(device, measure) {
	const listeners = listenersPerDevice.get(device)
	if (!listeners) {
		return
	}
	for (const listener of listeners) {
		try {
			listener.send({
				device,
				measure,
			})
		} catch(error) {
			console.warn(error.stack)
			console.log(listener)
			listener.close()
		}
	}
}


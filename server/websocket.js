
const listenersPerDevice = new Map()


export default async function setup(app) {
	app.get('/sync/:device', {websocket: true}, sync)
}

async function sync(socket, request) {
	const device = request.params.device
	// socket.on('message', message => console.log(`Received ${message}`))
	request.log.info(`New listener for ${device} on ${request.ip}`)
	if (!listenersPerDevice.has(device)) {
		listenersPerDevice.set(device, [])
	}
	listenersPerDevice.get(device).push(socket)
}

export async function sendMeasure(measure) {
	const device = measure.device
	// console.log(`Syncing measure for ${device}`)
	const listeners = listenersPerDevice.get(device)
	if (!listeners) {
		return
	}
	for (const listener of listeners) {
		try {
			const message = {
				device,
				measure,
			}
			listener.send(Buffer.from(JSON.stringify(message)))
		} catch(error) {
			console.warn(error.stack)
			listener.close()
		}
	}
}


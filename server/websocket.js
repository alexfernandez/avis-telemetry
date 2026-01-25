
const listenersPerDevice = new Map()


export async function setupWebsocket(app) {
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
		if (!listener) {
			continue
		}
		try {
			listener.send(JSON.stringify(measure))
		} catch(error) {
			console.warn(error.stack)
			listener.close()
			const index = listeners.indexOf(listener);
			if (index != -1) {
				listeners[index] = null
			}
		}
	}
}

export async function closeListeners() {
	for (const listeners of listenersPerDevice.values()) {
		for (const listener of listeners) {
			if (listener) {
				await listener.close()
			}
		}
	}
}


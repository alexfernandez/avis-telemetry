
const listenersPerDevice = new Map()


export async function setupWebsocket(app) {
	app.get('/sync/:device', {websocket: true}, sync)
}

async function sync(socket, request) {
	const device = request.params.device
	// socket.on('message', message => console.log(`Received ${message}`))
	if (!listenersPerDevice.has(device)) {
		listenersPerDevice.set(device, [])
	}
	const listeners = listenersPerDevice.get(device)
	listeners.push(socket)
	request.log.info(`New websocket for device ${device} on ${request.ip}, ${listeners.length} listeners`)
	socket.on('close', () => removeSocket(socket, device, request.log))
}

function removeSocket(socket, device, log) {
	const listeners = listenersPerDevice.get(device)
	const index = listeners.indexOf(socket);
	if (index != -1) {
		listeners.splice(index, 1)
	}
	log.info(`Websocket removed from device ${device}, ${listeners.length} listeners`)
}

export async function sendMeasure(measure) {
	const device = measure.device
	// console.log(`Syncing measure for ${device}`)
	const listeners = listenersPerDevice.get(device)
	if (!listeners) {
		return
	}
	for (const listener of [...listeners]) {
		if (!listener) {
			continue
		}
		try {
			listener.send(JSON.stringify(measure))
		} catch(error) {
			console.warn(error.stack)
			listener.close()
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


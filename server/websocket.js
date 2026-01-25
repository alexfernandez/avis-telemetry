
const listenersPerDevice = new Map()


export default async function setup(app) {
	app.get('/sync/:device', {websocket: true}, sync)
}

async function sync(socket, {request}) {
	const device = request.params.device
	request.log.info(`New listener for ${device} on ${request.ip}`)
	const listeners = listenersPerDevice.get(device) || []
	listeners.push(socket)
}

export async function sendMeasure(measure) {
	const device = measure.device
	// console.log(`Syncing measure for ${device}`, measure)
	const listeners = listenersPerDevice.get(device)
	if (!listeners) {
		return
	}
	for (const listener of listeners) {
		console.log(listener)
		console.log(`Updating ${listener} for ${device}`)
		try {
			listener.send({
				device,
				measure,
			})
		} catch(error) {
			console.warn(error.stack)
			listener.close()
		}
	}
}


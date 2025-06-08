import {getopt} from 'stdio'
import {randomUUID} from 'crypto'
import {sleepMs} from '../core/sleep.js'


await run()

async function run() {
	const options = getopt({
		rps: {key: 'r', description: 'requests per second', args: 1, default: 1},
		device: {key: 'd', description: 'device identifier', args: 1},
		server: {key: 's', description: 'server to test', args: 1, default: 'localhost:4215'},
		time: {key: 't', description: 'duration of the test (in seconds)', args: 1, default: 10},
	})
	console.log(`Running load tests for ${options.server} at ${options.rps} rps`)
	await runLoadTest(options)
}

async function runLoadTest({rps, device, server, time}) {
	if (!device) {
		device = `loadtest-device-${randomUUID().substring(0, 8)}`
	}
	const timeMs = time * 1000
	const delayMs = 1000 / rps
	const startMs = Date.now()
	while (true) {
		const nowMs = Date.now()
		if (nowMs - startMs > timeMs) {
			return
		}
		sendMeasureSafe(server, device)
		await sleepMs(delayMs)
	}
}

async function sendMeasureSafe(server, device) {
	try {
		await sendMeasure(server, device)
	} catch(error) {
		console.error(`Could not send measure: ${error.stack}`)
	}
}

async function sendMeasure(server, device) {
	const protocol = server.startsWith('localhost') ? 'http' : 'https'
	const url = `${protocol}://${server}/devices/${device}/measures`
	const measure = {
		identifier: randomUUID(),
		hugeNumber: 57,
		takenAt: new Date(),
	}
	const response = await fetch(url, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify(measure),
	})
	const result = await response.json()
	console.log(response.status, result)
}


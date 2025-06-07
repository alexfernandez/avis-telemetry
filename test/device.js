import {randomUUID} from 'crypto'
import {app, userAgent} from './setup.js'


async function testMeasures() {
	const deviceId = randomUUID()
	const response = await app.inject({
		url: `/devices/${deviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: {
			text: 'value',
			numeric: 87,
			takenAt: new Date(),
		},
	})
	console.assert(response.statusCode == 200, `could not post measure`)
	console.assert(response.json().ok, 'should post measure ok')
}

export default async function test() {
	await testMeasures()
}


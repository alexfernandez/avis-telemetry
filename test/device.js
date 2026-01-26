import {randomUUID} from 'crypto'
import {app, userAgent} from './setup.js'
import {sleepMs} from '../core/sleep.js'
import {setMinDelayMs} from '../controller/device.js'

const deviceId = `test-device-${randomUUID().substring(0, 8)}`
const altDeviceId = `test-device-${randomUUID().substring(0, 8)}`
const secretDeviceId = `test-device-${randomUUID().substring(0, 8)}`
const testMinDelayMs = 50


async function testMeasure() {
	const measure1 = {
		text: 'value',
		numeric: 87,
		takenAt: new Date(),
	}
	const response1 = await app.inject({
		url: `/devices/${deviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure1,
	})
	console.assert(response1.statusCode == 200, `could not post measure`)
	console.assert(response1.json().ok, 'should post measure ok')
	const response2 = await app.inject({
		url: `/devices/${deviceId}/measures/latest`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response2.statusCode == 200, `could not get latest measure`)
	const result2 = response2.json()
	console.assert(result2, 'should have result')
	console.assert(result2.measure, 'should have measure')
	console.assert(result2.measure.text == measure1.text, 'should have text value')
	console.assert(result2.measure.numeric == measure1.numeric, 'should have numeric value')
	console.assert(result2.takenAt, 'should have takenAt')
	console.assert(typeof result2.source == 'string', 'should have string source')
	console.assert(result2.source.startsWith('post'), 'should have post source')
}

async function testMeasureWithSecret() {
	const measure0 = {
		text: 'value1',
	}
	const response0 = await app.inject({
		url: `/devices/${secretDeviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure0,
	})
	console.assert(response0.statusCode == 200, `could not post measure without secret`)
	console.assert(response0.json().ok, 'should post measure without secret')
	await sleepMs(10)
	const measure1 = {
		text: 'value2',
		secret: "The larch",
	}
	const response1 = await app.inject({
		url: `/devices/${secretDeviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure1,
	})
	console.assert(response1.statusCode == 200, `could not post measure with secret: ${response1.statusCode}`)
	console.assert(response1.json().ok, 'should post measure with secret')
	const response2 = await app.inject({
		url: `/devices/${secretDeviceId}/measures/latest`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response2.statusCode == 200, `could not get latest measure`)
	const result2 = response2.json()
	console.assert(result2, 'should have result')
	console.assert(!result2.secret, 'should not have secret in result')
	console.assert(result2.measure, 'should have measure')
	console.assert(result2.measure.text == 'value2', 'should have last value')
	console.assert(!result2.measure.secret, 'should not have secret in measure')
	const measure3 = {
		text: 'value',
		secret: "Illustrated History of False Teeth",
	}
	const response3 = await app.inject({
		url: `/devices/${secretDeviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure3,
	})
	console.assert(response3.statusCode == 400, `should not post measure with bad secret`)
}

async function testConfig() {
	const config1 = {
		lever: 'value',
		range: 87,
		once: 788,
	}
	const response1 = await app.inject({
		url: `/devices/${deviceId}/config`,
		method: 'PUT',
		headers: {'user-agent': userAgent},
		body: config1,
	})
	console.assert(response1.statusCode == 200, `could not put config`)
	console.assert(response1.json().ok, 'should put config ok')
	const response2 = await app.inject({
		url: `/devices/${deviceId}/config`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response2.statusCode == 200, `could not get config`)
	const result2 = response2.json()
	console.assert(result2, 'should have config')
	console.assert(result2.lever == config1.lever, 'should have text value')
	console.assert(result2.range == config1.range, 'should have numeric value')
	console.assert(result2.once == config1.once, 'should have once value')
}

async function testConfigWithSecret() {
	const config1 = {
		lever: 'value1',
		secret: "the Big Cheese gets his at low tide tonight",
	}
	const response1 = await app.inject({
		url: `/devices/${secretDeviceId}/config`,
		method: 'PUT',
		headers: {'user-agent': userAgent},
		body: config1,
	})
	console.assert(response1.statusCode == 200, `could not put config with secret`)
	console.assert(response1.json().ok, 'should put config with secret')
	const response2 = await app.inject({
		url: `/devices/${secretDeviceId}/config`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response2.statusCode == 200, `could not get config`)
	const result2 = response2.json()
	console.assert(result2, 'should have config')
	console.assert(!result2.secret, 'should not have secret in config')
	const config3 = {
		lever: 'value',
		secret: "I hear the gooseberries are doing well this year",
	}
	const response3 = await app.inject({
		url: `/devices/${secretDeviceId}/config`,
		method: 'PUT',
		headers: {'user-agent': userAgent},
		body: config3,
	})
	console.assert(response3.statusCode == 400, `should not put config with bad secret`)
}

async function testInvalidCalls() {
	const measure1 = {
		takenAt: new Date(),
	}
	for (let i = 0; i < 100; i++) {
		measure1[`key${i}`] = 'a'.repeat(100)
	}
	const response1 = await app.inject({
		url: `/devices/${altDeviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure1,
	})
	console.assert(response1.statusCode == 400, `should not post measure too long`)
	const result = response1.json()
	console.assert(!result.ok, 'should not be ok')
	console.assert(result.error, 'should have error')
	const measure2 = {
		text: 'too fast too soon',
		numeric: 41,
		takenAt: new Date(),
	}
	const response2 = await app.inject({
		url: `/devices/${deviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure2,
	})
	console.assert(response2.statusCode == 400, `should not post measure before delay`)
	const config2 = {
		lever: 'new',
		range: 78,
		extra: 878,
	}
	const response3 = await app.inject({
		url: `/devices/${deviceId}/config`,
		method: 'PUT',
		headers: {'user-agent': userAgent},
		body: config2,
	})
	console.assert(response3.statusCode == 400, `should not put config before delay`)
}

async function testMeasureAfterDelay() {
	const measure2 = {
		text: 'different',
		numeric: 78,
		takenAt: new Date(),
	}
	const response3 = await app.inject({
		url: `/devices/${deviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure2,
	})
	console.assert(response3.statusCode == 200, `could not post another measure`)
	console.assert(response3.json().ok, 'should post another measure ok')
	const response4 = await app.inject({
		url: `/devices/${deviceId}/measures/latest`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response4.statusCode == 200, `could not get latest measure again`)
	const result4 = response4.json()
	console.assert(result4, 'should have result again')
	console.assert(result4.measure, 'should have measure again')
	console.assert(result4.measure.text == measure2.text, 'should have new text value')
	console.assert(result4.measure.numeric == measure2.numeric, 'should have new text value')
}

async function testMeasureWithoutTakenAt() {
	const measure = {
		text: 'without taken at',
		numeric: 13,
	}
	const response3 = await app.inject({
		url: `/devices/${deviceId}/measures`,
		method: 'POST',
		headers: {'user-agent': userAgent},
		body: measure,
	})
	console.assert(response3.statusCode == 200, `could not post without taken at`)
	console.assert(response3.json().ok, 'should post without taken at')
	const response4 = await app.inject({
		url: `/devices/${deviceId}/measures/latest`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response4.statusCode == 200, `could not get latest measure again`)
	const result4 = response4.json()
	console.assert(result4, 'should have result again')
	console.assert(result4.measure, 'should have measure again')
	console.assert(result4.measure.text != measure.text, 'should not have text value without taken at')
	console.assert(result4.measure.numeric != measure.numeric, 'should not have text value without taken at')
}

async function testConfigAfterDelay() {
	const config2 = {
		lever: 'new',
		range: 78,
		extra: 878,
	}
	const response3 = await app.inject({
		url: `/devices/${deviceId}/config`,
		method: 'PUT',
		headers: {'user-agent': userAgent},
		body: config2,
	})
	console.assert(response3.statusCode == 200, `could not put another config`)
	console.assert(response3.json().ok, 'should put another config ok')
	const response4 = await app.inject({
		url: `/devices/${deviceId}/config`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response4.statusCode == 200, `could not get config again`)
	const result4 = response4.json()
	console.assert(result4, 'should have config again')
	console.assert(result4.lever == config2.lever, 'should have new text value')
	console.assert(result4.range == config2.range, 'should have new text value')
	console.assert(result4.extra == config2.extra, 'should have extra value')
	console.assert(!result4.once, 'should not have once value')
}

async function testLastMeasures() {
	const limit = 10
	const measure1 = {
		text: 'value',
		numeric: 87,
		takenAt: new Date(),
	}
	for (let index = 0; index < limit + 1; index++) {
		const response1 = await app.inject({
			url: `/devices/${deviceId}/measures`,
			method: 'POST',
			headers: {'user-agent': userAgent},
			body: measure1,
		})
		console.assert(response1.statusCode == 200, `could not post measure ${index}`)
		console.assert(response1.json().ok, `should post measure ${index} ok`)
	}
	const response2 = await app.inject({
		url: `/devices/${deviceId}/measures?limit=${limit}`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response2.statusCode == 200, `could not get last measures`)
	const result2 = response2.json()
	console.assert(result2?.length, 'should have results')
	console.assert(result2.length == limit, `should have ${limit} results`)
	for (const record of result2) {
		console.assert(record.measure, 'should have measure')
		console.assert(record.measure.numeric == measure1.numeric, 'should have numeric value')
		console.assert(record.takenAt, 'should have takenAt')
	}
	const response3 = await app.inject({
		url: `/devices/${deviceId}/measures?limit=1000`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response3.statusCode == 400, `should not get too many measures`)
}

export default async function test() {
	setMinDelayMs(0)
	await testMeasure()
	await testMeasureWithSecret()
	await testConfig()
	await testConfigWithSecret()
	setMinDelayMs(testMinDelayMs)
	await testInvalidCalls()
	await sleepMs(testMinDelayMs + 1)
	await testMeasureAfterDelay()
	await sleepMs(testMinDelayMs + 1)
	await testMeasureWithoutTakenAt()
	await testConfigAfterDelay()
	setMinDelayMs(0)
	await testLastMeasures()
}


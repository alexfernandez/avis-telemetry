import {randomUUID} from 'crypto'
import dgram from 'node:dgram'
import {port} from '../core/config.js'
import {UdpServer} from '../server/udp.js'
import {sleepMs} from '../core/sleep.js'
import {app, userAgent} from './setup.js'

const device = `test-device-${randomUUID().substring(0, 8)}`


async function testUdpPacket() {
	await sleepMs(100)
	// adapted from https://gist.github.com/sid24rane/6e6698e93360f2694e310dd347a2e2eb
	const client = dgram.createSocket('udp4')
	const message = {
		device,
		text: 'something',
		numeric: 57,
	}
	const data = Buffer.from(JSON.stringify(message))
	client.send(data, port, 'localhost', (error) => {
		console.assert(!error, `should send without error`)
	})
	await sleepMs(100)
	client.close()
	const response1 = await app.inject({
		url: `/devices/${device}/measures/latest`,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response1.statusCode == 200, `could not get latest measure`)
	const result1 = response1.json()
	console.assert(result1, 'should have result')
	console.assert(result1.measure, 'should have measure')
	console.assert(result1.measure.text == message.text, 'should have text value')
	console.assert(result1.measure.numeric == message.numeric, 'should have text value')
}

export default async function test() {
	const server = new UdpServer(console)
	await server.start()
	await testUdpPacket()
	await server.close()
}


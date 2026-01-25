import {randomUUID} from 'crypto'
import dgram from 'node:dgram'
import {port} from '../core/config.js'
import {sleepMs} from '../core/sleep.js'
import {app, userAgent} from './setup.js'

const device = `test-device-${randomUUID().substring(0, 8)}`


async function testWebsocket() {
	await app.ready()
	await sleepMs(100)
	// adapted from https://gist.github.com/sid24rane/6e6698e93360f2694e310dd347a2e2eb
	const client = dgram.createSocket('udp4')
	const outgoing = {
		device,
		text: 'something',
		numeric: 57,
	}
	const data = Buffer.from(JSON.stringify(outgoing))
	client.send(data, port, 'localhost', (error) => {
		console.assert(!error, `should send without error`)
	})
	const websocket1 = await app.injectWS(`/sync/${device}`, {
		headers: {'user-agent': userAgent},
	})
	const messages = []
	websocket1.on('message', message => {
		const result = JSON.parse(String(message))
		messages.push(result)
	})
	await sleepMs(100)
	client.send(data, port, 'localhost', (error) => {
		console.assert(!error, `should send again without error`)
	})
	await sleepMs(100)
	console.assert(messages.length > 0, 'should get message')
	const message = messages[0]
	console.assert(message, 'should have message')
	console.assert(message.device, 'should have device')
	console.assert(message.text == message.text, 'should have text value')
	console.assert(message.numeric == message.numeric, 'should have text value')
	console.assert(typeof message.source == 'string', 'should have string source')
	console.assert(message.source.startsWith('udp '), 'should have udp source')
	websocket1.terminate()
	client.close()
}

export default async function test() {
	await testWebsocket()
}


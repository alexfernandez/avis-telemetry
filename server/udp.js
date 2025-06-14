import dgram from 'node:dgram'
import {port} from '../core/config.js'
import {storeMeasure} from '../db/device.js'


export class UdpServer {
	constructor() {
		this.server = null
	}

	async start() {
		this.server = dgram.createSocket('udp4')
		this.server.on('error', error => {
			console.error(`UDP server error`, error)
		})
		this.server.on('message', (payload, info) => this.receive(payload, info))
		this.server.on('listening', () => {
			const address = this.server.address()
			console.log(`UDP server is listening on ${address.address}:${address.port}`)
		})
		this.server.bind(port)
	}

	receive(payload, info) {
		console.log(`${new Date().toISOString()} Received ${payload.length} bytes from udp: ${info.address}:${info.port}`)
		try {
			this.process(payload)
		} catch(error) {
			console.warn(`${new Date().toISOString()} Could not process message`)
		}
	}

	process(payload) {
		const {device, takenAt, ...message} = JSON.parse(payload)
		storeMeasure(device, message, takenAt)
	}

	close() {
		this.server.close()
	}
}


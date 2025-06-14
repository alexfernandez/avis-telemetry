import dgram from 'node:dgram'
import {port} from '../core/config.js'
import {storeMeasure} from '../db/device.js'


export class UdpServer {
	constructor(logger) {
		this.server = null
		this.logger = logger
	}

	async start() {
		this.server = dgram.createSocket('udp4')
		this.server.on('error', error => {
			this.logger.error(`UDP server error`, error)
		})
		this.server.on('message', (payload, info) => this.receive(payload, info))
		this.server.on('listening', () => {
			const address = this.server.address()
			this.logger.info(`UDP server listening at ${address.address}:${address.port}`)
		})
		this.server.bind(port)
	}

	receive(payload, info) {
		this.logger.info(`Received ${payload.length} bytes from udp: ${info.address}:${info.port}`)
		try {
			this.process(payload)
		} catch(error) {
			this.logger.warn(`Could not process message`)
		}
	}

	process(payload) {
		const {device, takenAt, ...message} = JSON.parse(payload)
		storeMeasure(device, message, takenAt, 'udp')
	}

	close() {
		this.server.close()
	}
}


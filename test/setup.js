import Fastify from 'fastify'
import {setup, setupUdp} from '../server/setup.js'

export const site = 'test.com'
export const userAgent = 'testbot/1.0'


export const app = Fastify({logger: {level: 'error'}, transport: {target: 'pino-pretty'}})
await setup(app)
export const udpServer = await setupUdp(app)


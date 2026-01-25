import testPages from '../test/pages.js'
import testDevice from '../test/device.js'
import testUdp from '../test/udp.js'
import testWebsocket from '../test/websocket.js'
import {closeTests} from '../test/setup.js'
import {close} from '../db/sqlite.js'

await testPages()
await testDevice()
await testUdp()
await testWebsocket()
close()
await closeTests()


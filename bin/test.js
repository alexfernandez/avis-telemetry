import testPages from '../test/pages.js'
import testDevice from '../test/device.js'
import {close} from '../db/sqlite.js'

await testPages()
await testDevice()
close()


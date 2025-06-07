import testPages from '../test/pages.js'
import {close} from '../db/sqlite.js'

await testPages()
close()


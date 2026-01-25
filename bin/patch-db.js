import {getopt} from 'stdio'
import {addConfigSource} from '../db/sqlite.js'


await run()

async function run() {
	const options = getopt({
		configSource: {key: 'c', description: 'add config source'},
	})
	console.log(`Patching DB`)
	await runPatchDb(options)
}

async function runPatchDb(options) {
	if (options.configSource) {
		addConfigSource()
		console.log(`Config source added`)
		return
	}
	console.error(`No options specified`)
}


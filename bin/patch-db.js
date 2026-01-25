import {getopt} from 'stdio'
import {addConfigSource, addSecrets} from '../db/device.js'


await run()

async function run() {
	const options = getopt({
		configSource: {key: 'c', description: 'add source to configs'},
		secrets: {key: 's', description: 'add secrets to configs and measures'},
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
	if (options.secrets) {
		addSecrets()
		console.log(`Secrets added`)
		return
	}
	console.error(`No options specified`)
}


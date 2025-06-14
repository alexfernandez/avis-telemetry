import {app, userAgent} from './setup.js'


async function testHomePage() {
	const home = await testPage(`/`, 'Avis Telemetry')
	const matches = home.matchAll(/<a.href="(\/[^"]+)"/g)
	for (const match of matches) {
		const url = match[1]
		await testPage(url, [
			'for Device ',
			'Latest Measure',
			'Taken at',
			'Device Configuration',
		])
	}
}

async function testPage(url, checks, expectedStatus = 200) {
	const response = await app.inject({
		url,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response.statusCode == expectedStatus, `could not page ${url}`)
	const page = response.payload
	console.assert(page, `did not page ${url}`)
	const checkArray = checks.length ? checks : [checks]
	for (const check of checkArray) {
		console.assert(response.payload.includes(check), `failed page ${url} for ${check}`)
	}
	return page
}

export default async function test() {
	await testHomePage()
}


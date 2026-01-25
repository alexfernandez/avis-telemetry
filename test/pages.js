import {app, userAgent} from './setup.js'


async function testHomePage() {
	const home = await testPage(`/`, 'Avis Telemetry')
	const matches = home.matchAll(/<a.href="(\/[^"]+)"/g)
	const urls = [...matches.map(match => match[1])]
	console.assert(urls.length > 1, 'should match at least a couple of URLs')
	for (const url of urls) {
		await testPage(url, [
			'for Device ',
			'Last Measures',
			'takenAt',
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
		console.assert(page.includes(check), `failed page ${url} for ${check}`)
	}
	return page
}

export default async function test() {
	await testHomePage()
}


import {app, userAgent} from './setup.js'


async function testHomePage() {
	await testPage(`/`, 'Avis Telemetry')
}

async function testPage(url, checks, expectedStatus = 200) {
	const response = await app.inject({
		url,
		method: 'GET',
		headers: {'user-agent': userAgent},
	})
	console.assert(response.statusCode == expectedStatus, `could not page ${url}`)
	const checkArray = checks.length ? checks : [checks]
	for (const check of checkArray) {
		console.assert(response.payload.includes(check), `did not page ${url}`)
	}
}

export default async function test() {
	await testHomePage()
}


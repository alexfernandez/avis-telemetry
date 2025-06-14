import {createHead, createFooter} from './common.js'


export function createHome(latestDevices) {
	return `${createHead('Avis Telemetry')}
	<header>
		<div class="logo">
			<h1>
		    <a href="/" class="imageLink"><img src="/logo.svg" alt="Avis telemetry logo" /></a> Avis Telemetry
			</h1>
        </div>
	</header>
	<article>
		<h2 class="title">
		Telemetry for your Devices
		</h2>
		<p>
		Free, <a href="https://github.com/alexfernandez/avis-telemetry/">libre, open source</a>
		telemetry for your devices.
		No installation or configuration required.
		</p>
		<h2>Top Devices Today</h2>
		<table>
			<thead>
				<tr>
				<th>Devices</th>
				<th>Measures</th>
				</tr>
			</thead>
			<tbody>
				${createRows(latestDevices)}
			</tbody>
		</table>
		<h2>How to Use</h2>
		<p>
		Send your measures to the API endpoint:
		</p>
		<code>
		POST https://avistel.es/devices/[deviceId]/measures
		</code>
		<p>
		Add your telemetry measures to the body as a simple key-value JSON:
		</p>
		<code>
		{"height": 5, "name": "my-rover", "takenAt": "2025-06-07T19:02:57Z"}
		</code>
		<p>
		That's it!
		Your telemetry will be collected for your later use.
		</p>

	</article>
${createFooter()}`
}

function createRows(devices) {
	const rows = []
	for (const {device, total} of devices) {
		const row = `		<tr>
			<td><a href="/show/${device}">${device}</a></td>
			<td class="numeric">${total}</td>
		</tr>`
		rows.push(row)
	}
	return rows.join('\n')
}


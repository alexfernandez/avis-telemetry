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
		Add your telemetry measures to the body as a simple key-value JSON:
		</p>
		<code>
		{"height": 5, "name": "my-rover", "takenAt": "2025-06-07T19:02:57Z"}
		</code>
		<p>
		Send your measures to the API endpoint:
		</p>
		<code>
		POST https://avistel.es/devices/[deviceId]/measures
		</code>
		<p>
		Try it out with this simple Unix command:
		</p>
		<code>
		$ curl -d '{"value": 75, "secret": "web"}' -H "Content-Type: application/json" https://avistel.es/devices/web-test-device/measures
		</code>
		<p>
		Where <tt>web-test-device</tt> will be the device identifier.
		That's it!
		Your telemetry will be collected for your later use.
		</p>
		<h3>Using UDP</h3>
		<p>
		To avoid tying up your device with complex HTTPS requests,
		you can also send a UDP package to the 4215 port on the <tt>avistel.es</tt> server.
		In this case you should include the device identifier in the JSON:
		</p>
		<code>
		$ echo '{"device": "udp-test-device", "value": 76, "secret": "udp"}' | nc -4u -q 1 avistel.es 4215
		</code>
		<p>
		You can also store remote configurations and much more,
		please take a look at 
		<a href="https://github.com/alexfernandez/avis-telemetry/blob/main/docs/api.md">the complete API</a>.

		<h2>Anti-spoofing and Secrets</h2>

		<p>
		You may be wondering about those <code>"secret"</code> values we are sending in the examples.
		They have a very important mission.
		If we don't take precautions anyone can send measures as any device,
		and reconfigure any device they want.
		This is an unfortunate side-effect of the total freedom in the API.
		</p>

		<p>
		Introducing the secrets API:
		when you include a <code>secret</code> value in your measure,
		the server will check that any subsequent measures have the same <code>secret</code>.
		This value is not exposed in any way by the server,
		so only the original sender will know it.
		</p>

		<p>
		You can generate this <code>secret</code> in the device as an UUID,
		for instance.
		If you prefer not to send it then the server will not reject any subsequent measures,
		until such point as when you choose to send it;
		from there it will be required for everyone.
		Just try it out with this Unix command:
		</p>
		<code>
		$ curl -d '{"value": 75, "secret": "fake"}' -H "Content-Type: application/json" https://avistel.es/devices/web-test-device/measures
		</code>

		<p>
		The same can be done with configurations:
		if you send a <code>secret</code> value,
		then any subsequent configurations for that device will be rejected
		unless the secret matches exactly.
		It can however be a different <code>secret</code> than measures,
		since configs are supposed to be sent by a server and not by the devices.
		</p>

		<h2>Compliance</h2>

		<p>
		This site does not track you in any way.
		We keep a visit counter using <a href="https://librecounter.org/">LibreCounter.org</a>,
		which is fully GDPR-compliant.
		</p>
		<p>
		Any device information sent to <a href="https://avistel.es/">avistel.es</a> is stored in our server,
		and displayed publicly to anyone with the curiosity to find it.
		Never send any personally-identifying information.
		If you have sensitive data please
		<a href="https://github.com/alexfernandez/avis-telemetry/blob/main/docs/install.md">set up your own server</a>
		and use it instead,
		it is quite straightforward!

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


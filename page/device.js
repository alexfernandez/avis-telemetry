import {createHead, createFooter} from './common.js'
import {readConfig, readLatestMeasure} from '../db/device.js'


export function createDevicePage(device) {
	const title = `Avis Telemetry for device ${device}`
	const config = readConfig(device)
	const latestMeasure = readLatestMeasure(device)
	return `${createHead(title)}
	<header>
		<div class="logo">
			<h1>
		    <a href="/" class="imageLink"><img src="/logo.svg" alt="Avis telemetry logo" /></a> Avis Telemetry for Device ${device}
			</h1>
        </div>
	</header>
	<article>
		<h2>Latest Measure</h2>
		<p>Taken at ${latestMeasure.takenAt}:</p>
		<table>
			<thead>
				<tr>
				<th>Key</th>
				<th>Value</th>
				</tr>
			</thead>
			<tbody>
				${createRows(latestMeasure.measure)}
			</tbody>
		</table>
		<h2>Device Configuration</h2>
		${createConfigFrom(config)}

	</article>
${createFooter()}`
}

function createRows(object) {
	const rows = []
	for (const key in object) {
		const value = object[key]
		const row = `		<tr>
			<td>${key}</td>
			<td class="numeric">${value}</td>
		</tr>`
		rows.push(row)
	}
	return rows.join('\n')
}

function createConfigFrom(config) {
	if (!config) {
		return `<p>No device configuration</p>`
	}
	return `
		<p>Received at ${config.createdAt}:</p>
		<table>
			<thead>
				<tr>
				<th>Key</th>
				<th>Value</th>
				</tr>
			</thead>
			<tbody>
				${createRows(config.config)}
			</tbody>
		</table>
		`
}


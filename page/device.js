import {createHead, createFooter} from './common.js'
import {readConfig, readLastMeasures} from '../db/device.js'

const limit = 10


export function createDevicePage(device) {
	const title = `Avis Telemetry for device ${device}`
	const config = readConfig(device)
	const measures = readLastMeasures(device, limit)
	return `${createHead(title)}
	<header>
		<div class="logo">
			<h1>
		    <a href="/" class="imageLink"><img src="/logo.svg" alt="Avis telemetry logo" /></a> Avis Telemetry for Device ${device}
			</h1>
        </div>
	</header>
	<article>
		<h2>Last Measures</h2>
		${createMeasureTable(measures)}
		<h2>Device Configuration</h2>
		${createConfigFrom(config)}

	</article>
${createFooter()}`
}

function createMeasureTable(measures) {
	if (!measures?.length) {
		return `      <p>No measures yet</p>`
	}
	const keys = extractKeys(measures)
	return `
		<table>
			<thead>
				<tr>
				${createHeader(keys, 'measure')}
				</tr>
			</thead>
			<tbody class="tbody measure">
				${createRows(measures, keys)}
			</tbody>
		</table>
		`
}

function extractKeys(measures, field = 'measure') {
	const counts = {}
	for (const measure of measures) {
		for (const key of Object.keys(measure[field])) {
			counts[key] = (counts[key] ?? 0) + 1
		}
	}
	return Object.keys(counts)
}

function createHeader(keys, type) {
	if (!keys?.length) {
		return ''
	}
	const fullKeys = ['takenAt', 'source', ...keys]
	const rows = []
	for (const key of fullKeys) {
		rows.push(`            <th class="header ${type}">${key}</th>`)
	}
	return rows.join('\n')
}

function createRows(measures, keys) {
	const rows = []
	for (const measure of measures) {
		if (!measure) {
			return ''
		}
		const row = createRow(measure, keys)
		const fullRow = [`    <tr class="row measure">`, ...row, `    <tr>`]
		rows.push(fullRow.join('\n'))
	}
	return rows.join('\n')
}

function createRow(object, keys, field = 'measure') {
	if (!object) {
		return []
	}
	const values = [object.takenAt || object.createdAt, object.source]
	for (const key of keys) {
		values.push(object[field][key] ?? '--')
	}
	return values.map(value => `      <td class="numeric ${field}">${value}</td>`)
}

function createConfigFrom(config) {
	if (!config) {
		return `<p>No device configuration</p>`
	}
	const keys = extractKeys([config], 'config')
	return `
		<table>
			<thead>
				<tr>
				${createHeader(keys, 'config')}
				</tr>
			</thead>
			<tbody>
				<tr>
				${createRow(config, keys, 'config').join('\n')}
				</tr>
			</tbody>
		</table>
		`
}



let coolOffSeconds = 1
const maxCoolOffSeconds = 300
const maxRows = 15


checkDevice(window.location.href)

function checkDevice(href) {
	const url = URL.parse(href)
	const slug = '/show/'
	if (!url.pathname.startsWith(slug)) {
		return
	}
	const device = url.pathname.substring(slug.length)
	connectAndRetry(device, url)
}

function connectToSync(device, url) {
	return new Promise((resolve, reject) => {
		const destination = `${url.origin.replace(/^http/, 'ws')}/sync/${device}`
		const socket = new WebSocket(destination)
		socket.addEventListener('open', resolve)
		socket.addEventListener('message', message => {
			const measure = JSON.parse(message.data)
			console.log(`Showing new measure`)
			showMeasure(measure)
		})
		socket.addEventListener('error', error => {
			reject(error)
		})
		socket.addEventListener('close', async() => {
			console.log(`Reconnecting in ${coolOffSeconds} seconds...`)
			await sleep(coolOffSeconds * 1000)
			await connectAndRetry(device, url)
		})
	})
}

async function connectAndRetry(device, url) {
	try {
		await connectToSync(device, url)
		console.log(`Syncing to device ${device}`)
		coolOffSeconds = 1
	} catch(error) {
		// will reconnect on its own
		coolOffSeconds = Math.min(coolOffSeconds * 2, maxCoolOffSeconds)
	}
}

function showMeasure(measure) {
	const headers = document.getElementsByClassName('header measure')
	const row = document.createElement('tr')
	row.className = 'row measure'
	for (const header of headers) {
		const key = header.innerText
		const value = measure[key] || measure.measure[key] || '--'
		const cell = document.createElement('td')
		cell.innerText = value
		cell.className = 'numeric measure'
		row.append(cell)
	}
	const tbody = document.getElementsByClassName('tbody measure')[0]
	tbody.prepend(row)
	if (tbody.children.length > maxRows) {
		tbody.removeChild(tbody.children[tbody.children.length - 1])
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


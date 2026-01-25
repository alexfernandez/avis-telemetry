

checkDevice(window.location.href)

function checkDevice(href) {
	const url = URL.parse(href)
	const slug = '/show/'
	if (!url.pathname.startsWith(slug)) {
		return
	}
	const device = url.pathname.substring(slug.length)
	console.log(`*** connecting to ${device}`)
	connectToSync(device, url)
}

function connectToSync(device, url) {
	console.log(`Syncing to device ${device}`)
	const destination = `${url.origin.replace(/^http/, 'ws')}/sync/${device}`
	const socket = new WebSocket(destination)
	socket.addEventListener('open', () => console.log(`Connected to server`))
	socket.addEventListener('message', message => {
		const measure = JSON.parse(message.data)
		console.log(`Message from server`, measure)
		showMeasure(measure)
	})
	socket.addEventListener('error', error => console.warn(`Websocket error:`, error))
	socket.addEventListener('close', async() => {
		await sleep(1000)
		console.log(`Reconnecting to server`)
		//connectToSync(device, url)
	})
}

function showMeasure(measure) {
	const headers = document.getElementsByClassName('header measure')
	const row = document.createElement('tr')
	row.className = 'row measure'
	for (const header of headers) {
		const key = header.innerText
		const value = measure[key] || measure.measure[key]
		const cell = document.createElement('td')
		cell.innerText = value
		cell.className = 'numeric measure'
		row.append(cell)
	}
	const tbody = document.getElementsByClassName('tbody measure')[0]
	tbody.prepend(row)
	const lastRow = tbody.lastChild
	tbody.removeChild(lastRow)
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


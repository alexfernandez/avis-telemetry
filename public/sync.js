

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
			await sleep(1000)
			console.log(`Reconnecting to server`)
			await connectAndRetry(device, url)
		})
	})
}

async function connectAndRetry(device, url) {
	try {
		await connectToSync(device, url)
		console.log(`Syncing to device ${device}`)
	} catch(error) {
		await sleep(1000)
		await connectAndRetry(device, url)
	}
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
	tbody.removeChild(tbody.children[tbody.children.length - 1])
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


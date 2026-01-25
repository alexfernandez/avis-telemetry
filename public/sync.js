

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
	socket.addEventListener('message', measure => {
		console.log(`Message from server: ${measure}`)
	})
	socket.addEventListener('error', error => console.warn(`Websocket error:`, error))
	socket.addEventListener('close', async() => {
		await sleep(1000)
		console.log(`Reconnecting to server`)
		connectToSync(device, url)
	})
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


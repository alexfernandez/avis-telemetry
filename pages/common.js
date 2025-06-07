

export function createHead(title) {
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, minimum-scale=1">
	<title>${title}</title>
	<link rel="shortcut icon" href="/favicon.png">
	<link rel="stylesheet" href="/main.css">
</head>
<body>
`
}

export function createFooter() {
	return `
	<footer>
		<p>
			© 2025 <a href="https://pinchito.es/">Alex "pinchito" Fernández</a> and <a href="https://github.com/alexfernandez/avis-telemetry/graphs/contributors">contributors</a>.
			<br />
			See <a href="https://github.com/alexfernandez/avis-telemetry/">project details</a>.
		</p>
		<a href="https://librecounter.org/referer/show" target="_blank">
<img src="https://librecounter.org/counter.svg" referrerPolicy="unsafe-url" />
</a>
	</footer>

</body>
</html>`
}


// Fetch http document from url
console.log("Starting fetcher.js");

export async function fetch(url) {
	console.log("[fetcher.js:fetch] Fetching " + url);

	const response = await fetch(url)
		.then((response) => {
			console.log("[fetcher.js:fetch] Success.");
			return response.text();
		})
		.catch((error) => {
			console.log("[fetcher.js:appendToCache] Error: " + error.message);
		});

	return response;
}

// Fetch http document from url
console.log("[fetcher.js]");

export async function fetchHttpText(url) {
	console.log("[fetcher.js:fetch] Fetching " + url);

	return await fetch(url)
		.then((response) => {
			console.log("[fetcher.js:fetch] Success.");
			return response.text();
		})
		.catch((error) => {
			console.log("[fetcher.js:fetch] Error: " + error.message);
			return;
		});
}

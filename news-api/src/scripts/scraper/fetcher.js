// Fetch http document from url
console.log("[fetcher.js]");

export async function fetchHttpText(url) {
	if (url === undefined || url === null || url === "") {
		console.log("[fetcher:fetch] Error: url is undefined or null.");

		throw new Error("url is undefined or null.");
	}

	// remove all after .html
	url = url.replace(/.html.*/, ".html");

	// console.log("[fetcher:fetch] Fetching " + url);

	return await fetch(url)
		.then((response) => {
			// console.log("[fetcher:fetch] Success.");
			return response.text();
		})
		.catch((error) => {
			console.log("[fetcher:fetch] Error: " + error.message);
			return;
		});
}

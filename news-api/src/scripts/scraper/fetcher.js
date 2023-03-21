// Fetch http document from url
console.log("\n[fetcher.js]");

export async function fetchHttpText(url) {
	if (url === undefined || url === null || url === "") {
		console.log("\n[fetcher:fetch] Error: url is undefined or null.");

		throw new Error("url is undefined or null.");
	}

	// remove all after .html
	url = url.replace(/.html.*/, ".html");

	// console.log("\n[fetcher:fetch] Fetching " + url);

	return await fetch(url)
		.then((response) => {
			// console.log("\n[fetcher:fetch] Success.");
			return response.text();
		})
		.catch((error) => {
			console.log("\n[fetcher:fetch] Error: " + error.message);
			return;
		});
}

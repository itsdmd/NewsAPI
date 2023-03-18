// Scrape the news website for articles
console.log("[scraper.js]");

async function scrape(mode, url, limit = -1) {
	console.log("[scraper.js:scrape] mode: " + mode + ", url: " + url + ", limit: " + limit);

	/* #region   */
	let fetcher = await import("./fetcher.js")
		.then((fetcher) => {
			return fetcher;
		})
		.catch((error) => {
			console.error("[scraper.js:scrape] Error importing fetcher: " + error.message);
		});

	let parser = await import("./parser.js")
		.then((parser) => {
			return parser;
		})
		.catch((error) => {
			console.error("[scraper.js:scrape] Error importing parser: " + error.message);
		});

	let cacher = await import("./cacher.js")
		.then((cacher) => {
			return cacher;
		})
		.catch((error) => {
			console.error("[scraper.js:scrape] Error importing cacher: " + error.message);
		});
	/* #endregion */

	switch (mode) {
		case "vnx": {
			let i = limit;
			while (i !== 0) {
				// the url passed in is the first page of the feed
				let html = await fetcher.fetch(url);

				// scrape all the item-news url and pass them to cacher
				let urls = await parser.parseJsdom(html, "vnx-feed");
				await cacher.cache(urls, "vnx-article");

				// then scrape the next page's url and repeat the process
				url = await parser.parseJsdom(html, "vnx-next-page");

				i--;
			}
		}

		default:
			console.error("[scraper.js:scrape] Error: Invalid mode");
			break;
	}
}

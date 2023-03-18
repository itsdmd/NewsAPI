// Scrape the news website for articles
console.log("[scraper.js]");

import * as cacher from "./cacher.js";
import * as fetcher from "./fetcher.js";
import * as parser from "./parser.js";

// set limit = -1 to scrape all pages
export async function scrape(mode, baseUrl, startUrl, limit = 1) {
	console.log("[scraper.js:scrape] mode: " + mode + ", url: " + startUrl + ", limit: " + limit);

	switch (mode) {
		case "vnx": {
			let i = limit;
			while (i !== 0) {
				if (startUrl === baseUrl + "undefined") {
					break;
				}

				// the url passed in is the first page of the feed
				let html = parser.htmlToJsdom(await fetcher.fetchHttpText(startUrl));

				// scrape all the item-news url and pass them to cacher
				let urls = await parser.parseJsdom(html, "vnx-feed");
				await cacher.cache(urls, "vnx-article");

				// then scrape the next page's url and repeat the process
				startUrl = baseUrl + (await parser.parseJsdom(html, "vnx-next-page"));

				i--;
			}

			return;
		}

		default: {
			console.log("[scraper.js:scrape] Error: Invalid mode");
			break;
		}
	}
}

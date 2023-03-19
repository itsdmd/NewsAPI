// Scrape the news website for articles
console.log("[scraper.js]");

import * as cacher from "./cacher.js";
import * as fetcher from "./fetcher.js";
import * as parser from "./parser.js";

// set limit = -1 to scrape all pages
export async function scrape(mode, baseUrl, startUrl, limit = 1) {
	if (limit === -1) {
		// set hard limit of 5000
		limit = 5000;
	}

	console.log("[scraper.js:scrape] mode: " + mode + ", url: " + startUrl + ", limit: " + limit);

	switch (mode) {
		case "vnx-vn": {
			let i = limit;
			while (i !== 0) {
				console.log("[scraper.js:scrape] Feed: " + startUrl);

				if (startUrl === baseUrl + "undefined") {
					break;
				}

				try {
					// the url passed in is the first page of the feed
					let html = parser.htmlToJsdom(await fetcher.fetchHttpText(startUrl));

					// scrape all the item-news url and pass them to cacher
					let urls = await parser.parseJsdom(html, "vnx-vn-feed");

					try {
						await cacher.cache(urls, "vnx-vn");
					} catch (error) {
						console.log("[scraper.js:scrape] Error: " + error.message);
						return;
					}

					// then scrape the next page's url and repeat the process
					startUrl = baseUrl + (await parser.parseJsdom(html, "vnx-vn-next-page"));

					i--;
				} catch (error) {
					console.log("[scraper.js:scrape] Error: " + error.message);
					return;
				}
			}

			return;
		}

		case "vnx-en": {
			let i = limit;
			let page = 1;

			while (i !== 0) {
				// https://e.vnexpress.net/category/listcategory/category_id/1003895/page/1
				// ctg:
				// 		1003894:news
				// 		1003895:business

				let html = await fetcher.fetchHttpText(startUrl);

				try {
					// remove first 19 characters and final 21 characters
					html = html.substring(19, html.length - 21);
					// remove all \n
					html = html.replace(/\n/g, "");
					// remove all \t
					html = html.replace(/\t/g, "");
					// replace \" with "
					html = html.replace(/\\"/g, '"');
					// replace \/ with /
					html = html.replace(/\\\//g, "/");

					// console.log("[scraper.js:scrape] HTML: " + html);

					let urls = await parser.parseJsdom(parser.htmlToJsdom(html), "vnx-en-feed");
					try {
						await cacher.cache(urls, "vnx-en");
					} catch (error) {
						console.log("[scraper.js:scrape] Error: " + error.message);
						return;
					}

					page++;
					startUrl = baseUrl + page.toString();

					i--;
				} catch (error) {
					console.log("[scraper.js:scrape] Error: " + error.message);
					return;
				}
			}

			return;
		}

		case "tt-vn": {
			let i = limit;

			while (i !== 0) {
				// https://tuoitre.vn/timeline/3/trang-1.htm
				// https://tuoitre.vn/timeline/3/trang-10.htm
				// https://tuoitre.vn/timeline/3/trang-100.htm
				// timeline:
				// 		3:news
				// 		11:business

				try {
					let html = await fetcher.fetchHttpText(startUrl);

					let urls = await parser.parseJsdom(parser.htmlToJsdom(html), "tt-vn-feed");
					try {
						await cacher.cache(urls, "tt-vn");
					} catch (error) {
						console.log("[scraper.js:scrape] Error: " + error.message);
						return;
					}

					// page number between the last - and before .htm
					let page = parseInt(startUrl.substring(startUrl.lastIndexOf("-") + 1, startUrl.lastIndexOf(".htm")));
					page++;
					startUrl = baseUrl + "trang-" + page.toString() + ".htm";

					i--;
				} catch (error) {
					console.log("[scraper.js:scrape] Error: " + error.message);
					return;
				}
			}

			return;
		}

		default: {
			console.log("[scraper.js:scrape] Error: Invalid mode");
			break;
		}
	}
}

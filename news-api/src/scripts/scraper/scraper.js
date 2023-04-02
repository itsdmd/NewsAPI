// Scrape the news website for articles
console.log("\n[scraper.js]");

import * as cacher from "./cacher.js";
import * as fetcher from "./fetcher.js";
import * as parser from "./parser.js";

// set limit = -1 to scrape all pages
export async function scrape(mode, baseUrl, startUrl, limit = 1) {
	if (limit === -1) {
		// set hard limit of 5000
		limit = 100;

		if (mode === "vnx-vn") {
			limit = 20;
		}
	}

	console.log("\n[scraper:scrape] mode: " + mode + ", url: " + startUrl + ", limit: " + limit);

	switch (mode) {
		case "tt-vn": {
			let i = limit;

			while (i !== 0) {
				console.log("\n[scraper:scrape] Page " + (limit - i + 1) + " / " + limit);

				try {
					const html = await fetcher.fetchHttpText(startUrl);

					const urls = await parser.parseDom(parser.htmlToJsdom(html), "tt-vn-feed");

					await cacher.cacheMany(urls, mode, false).catch((error) => {
						console.log("\n[scraper:scrape] Error: " + error.message);
						return;
					});

					if (urls.length === 0) {
						setTimeout(() => {
							console.log("\n[fetcher:fetch] Waiting. Started at " + new Date().toLocaleString());
						}, 1000000).then(async () => {
							urls = await parser.parseDom(parser.htmlToJsdom(html), "tn-vn-feed");
							if (urls.length === 0) {
								console.log("\n[fetcher:fetch] Error: scraping failed. Exitting...");
								process.exit();
							} else {
								return;
							}
						});
					}

					await parser
						.parseCache(mode)
						.then(() => {
							console.log("\n[scraper:scrape] Cache parsed");
						})
						.catch((error) => {
							console.log("\n[scraper:scrape] Error parsing: " + error.message);
							return;
						});

					// https://tuoitre.vn/timeline/3/trang-1.htm
					let page = parseInt(startUrl.substring(startUrl.lastIndexOf("-") + 1, startUrl.lastIndexOf(".htm")));
					page++;
					startUrl = baseUrl + "trang-" + page.toString() + ".htm";

					i--;
				} catch (error) {
					console.log("\n[scraper:scrape] Error: " + error.message);
					return;
				}
			}

			return;
		}

		case "tn-vn": {
			let i = limit;

			while (i !== 0) {
				console.log("\n[scraper:scrape] Page " + (limit - i + 1) + " / " + limit);

				try {
					const html = await fetcher.fetchHttpText(startUrl);

					let urls = await parser.parseDom(parser.htmlToJsdom(html), "tn-vn-feed");

					if (urls.length === 0) {
						let limit = 10;

						do {
							setTimeout(() => {
								console.log("\n[scraper:scrape] Waiting 10secs. Started at " + new Date().toLocaleString());
							}, 10000);

							urls = await parser.parseDom(parser.htmlToJsdom(html), "tn-vn-feed");
							limit--;
						} while (urls.length === 0 && limit !== 0);

						if (urls.length === 0) {
							console.log("\n[scraper:scrape] Error: scraping failed. Skipping...");

							i--;
							continue;
						}
					}

					await cacher.cacheMany(urls, mode, false).catch((error) => {
						console.log("\n[scraper:scrape] Error caching: " + error.message);
						return;
					});

					await parser
						.parseCache(mode)
						.then(() => {
							console.log("\n[scraper:scrape] Cache parsed");
						})
						.catch((error) => {
							console.log("\n[scraper:scrape] Error parsing: " + error.message);
							return;
						});

					// https://thanhnien.vn/timelinelist/1854/1.htm

					let page = parseInt(startUrl.substring(startUrl.lastIndexOf("/") + 1, startUrl.lastIndexOf(".htm")));
					page++;
					startUrl = baseUrl + page.toString() + ".htm";

					i--;
				} catch (error) {
					console.log("\n[scraper:scrape] Error: " + error.message);
					return;
				}
			}

			return;
		}

		case "vnx-vn": {
			/* #region   */
			// json: https://gw.vnexpress.net/ar/get_rule_2?category_id=1001001&limit=100&data_select=article_id,article_type,title,lead,share_url,thumbnail_url,original_cate,article_category,publish_time&thumb_size=300x180&thumb_quality=100
			// category_id:
			// 1001001: all
			// 1001002: the gioi
			// 1004678: chinh tri
			// 1001007: phap luat
			/* #endregion */
			let i = limit;

			while (i !== 0) {
				console.log("\n[scraper:scrape] Page " + (limit - i + 1) + " / " + limit);

				try {
					const html = await fetcher.fetchHttpText(startUrl);

					let feedEntries = await parser.parseDom(parser.htmlToJsdom(html), "vnx-vn-feed");

					let urlsArticle = [];
					let urlsGallery = [];
					feedEntries.forEach((entry) => {
						if (entry.type === "article") {
							urlsArticle.push(entry.url);
						} else if (entry.type === "gallery") {
							urlsGallery.push(entry.url);
						}
					});

					console.log("\n[scraper:scrape] Article urls: " + urlsArticle.length);
					console.log("\n[scraper:scrape] Gallery urls: " + urlsGallery.length);

					if (urlsArticle.length + urlsGallery.length === 0) {
						console.log("\n[scraper:scrape] No urls found. Skipping...");
						return;
					}

					/* ------------- article ------------ */
					await cacher.cacheMany(urlsArticle, mode, false).catch((error) => {
						console.log("\n[scraper:scrape] Error caching: " + error.message);
						return;
					});

					await parser
						.parseCache("vnx-vn-article")
						.then(() => {
							console.log("\n[scraper:scrape] Cache parsed");
						})
						.catch((error) => {
							console.log("\n[scraper:scrape] Error parsing: " + error.message);
							return;
						});

					/* ------------- gallery ------------ */
					await cacher.cacheMany(urlsGallery, mode, false).catch((error) => {
						console.log("\n[scraper:scrape] Error caching: " + error.message);
						return;
					});

					await parser
						.parseCache("vnx-vn-gallery")
						.then(() => {
							console.log("\n[scraper:scrape] Cache parsed");
						})
						.catch((error) => {
							console.log("\n[scraper:scrape] Error parsing: " + error.message);
							return;
						});

					// https://vnexpress.net/thoi-su-p2

					let page = parseInt(startUrl.substring(startUrl.lastIndexOf("-p") + 2));
					page++;
					startUrl = baseUrl + "-p" + page.toString();

					i--;
				} catch (error) {
					console.log("\n[scraper:scrape] Error: " + error.message);
					return;
				}
			}

			return;
		}

		default: {
			console.log("\n[scraper:scrape] Error: Invalid mode");
			break;
		}
	}
}

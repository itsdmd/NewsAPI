import * as scraper from "./scraper/scraper.js";

async function scrape(mode, baseUrl, startUrl, limit = 1) {
	/* ------------ scraping ------------ */
	await scraper
		.scrape(mode, baseUrl, startUrl, limit)
		.catch((error) => {
			console.log("\n[refetch:scrape] Error: " + error.message);
		})
		.finally(async () => {
			console.log("\n[refetch:scrape] Done scraping");
		});

	return;
}

await scrape("tt-vn", "https://tuoitre.vn/timeline/3/", "https://tuoitre.vn/timeline/3/trang-1.htm", 1);
await scrape("tn-vn", "https://thanhnien.vn/timelinelist/1854/", "https://thanhnien.vn/timelinelist/1854/1.htm", 1);
await scraper.scrape("vnx-vn", "https://vnexpress.net/thoi-su", "https://vnexpress.net/thoi-su-p1", 1);

process.exit(0);

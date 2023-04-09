import * as dotenv from "dotenv";
dotenv.config();

import * as scraper from "./scraper/scraper.js";

import * as fs from "fs";
const logFileDir = process.env.REFETCH_LOG_FILE_PATH;

async function scrape(mode, baseUrl, startUrl, limit = 1) {
	/* ------------ scraping ------------ */
	await scraper
		.scrape(mode, baseUrl, startUrl, limit)
		.then(() => {
			const logData = new Date().toISOString() + " " + mode + " " + limit + " || Success\n";

			fs.appendFile(logFileDir, logData, (error) => {
				if (error) {
					console.log("\n[refetch:scrape] Error appendFile: " + error.message);
				}
			});
		})
		.catch((error) => {
			console.log("\n[refetch:scrape] Error: " + error.message);

			const logData = new Date().toISOString() + " " + mode + " " + limit + " || Error: " + error.message + "\n";

			fs.appendFile(logFileDir, logData, (error) => {
				if (error) {
					console.log("\n[refetch:scrape] Error appendFile: " + error.message);
				}
			});
		})
		.finally(async () => {
			console.log("\n[refetch:scrape] Done scraping");
		});

	return;
}

await scrape("tt-vn", "https://tuoitre.vn/timeline/3/", "https://tuoitre.vn/timeline/3/trang-1.htm", 1);
await scrape("tn-vn", "https://thanhnien.vn/timelinelist/1854/", "https://thanhnien.vn/timelinelist/1854/1.htm", 1);
await scrape("vnx-vn", "https://vnexpress.net/thoi-su", "https://vnexpress.net/thoi-su-p1", 1);

process.exit(0);

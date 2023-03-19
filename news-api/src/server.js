console.log("[server.js]");

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { dateRouter } from "./routers/date.js";
import * as parser from "./scripts/scraper/parser.js";
import * as scraper from "./scripts/scraper/scraper.js";

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use("/date", dateRouter);

app.listen(port, () => {
	console.log("[server.js:main] Listening on port " + port);
});

async function main(mode, baseUrl, startUrl, limit = 1) {
	console.log("[server.js:main]");

	/* ------------ scraping ------------ */
	await scraper
		.scrape(mode, baseUrl, startUrl, limit)
		.catch((error) => {
			console.log("[server.js:main] Error: " + error.message);
		})
		.finally(async () => {
			console.log("[server.js:main] Done scraping");

			/* ------------ parsing ------------ */
			await parser.parseCache(mode).finally(() => {
				console.log("[server.js:main] Done parsing");
			});
		});
}

// import * as cacher from "./scripts/scraper/cacher.js";
async function test() {
	// await cacher.addToCache("https://tuoitre.vn/quoc-hoi-my-chia-re-vu-cam-tiktok-20230301121811715.htm", "tt-vn");

	await parser.parseCache("tt-vn").finally(() => {
		console.log("[server.js:main] Done parsing");
	});
}

// await test();

// await main("vnx-vn", "https://vnexpress.net", "https://vnexpress.net/thoi-su", 2).then(() => {
// 	main("vnx-vn", "https://vnexpress.net", "https://vnexpress.net/kinh-doanh", 2);
// });

// await main(
// 	"vnx-en",
// 	"https://e.vnexpress.net/category/listcategory/category_id/1003895/page/",
// 	"https://e.vnexpress.net/category/listcategory/category_id/1003895/page/1",
// 	-1
// );

await main("tt-vn", "https://tuoitre.vn/timeline/3/", "https://tuoitre.vn/timeline/3/trang-1.htm", -1);

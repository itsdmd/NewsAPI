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
	console.log("[server:main] Listening on port " + port);
});

async function main(mode, baseUrl, startUrl, limit = 1) {
	console.log("[server:main]");

	// https://tuoitre.vn/timeline/3/trang-10.htm
	// timeline:
	// 		3:news
	// 		11:business
	// 		200029:tech

	/* ------------ scraping ------------ */
	await scraper.scrape(mode, baseUrl, startUrl, limit).catch((error) => {
		console.log("[server:main] Error: " + error.message);
		// })
		// .finally(async () => {
		// 	console.log("[server:main] Done scraping");

		// 	/* ------------ parsing ------------ */
		// 	await parser.parseCache(mode).finally(() => {
		// 		console.log("[server:main] Done parsing");
		// 	});
	});
}

// import * as cacher from "./scripts/scraper/cacher.js";
async function test() {
	await main("tn-vn", "https://thanhnien.vn/timelinelist/1854/", "https://thanhnien.vn/timelinelist/1854/1.htm", 10500);
}

await test();

// await main("vnx-vn", "https://vnexpress.net", "https://vnexpress.net/thoi-su", 2).then(() => {
// 	main("vnx-vn", "https://vnexpress.net", "https://vnexpress.net/kinh-doanh", 2);
// });

// await main(
// 	"vnx-en",
// 	"https://e.vnexpress.net/category/listcategory/category_id/1003895/page/",
// 	"https://e.vnexpress.net/category/listcategory/category_id/1003895/page/1",
// 	-1
// );

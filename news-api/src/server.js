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
		.finally(() => {
			console.log("[server.js:main] Done scraping");
		})
		.finally(() => {
			console.log("[server.js:main] Done scraping");

			/* ------------ parsing ------------ */
			parser.parse(mode).finally(() => {
				console.log("[server.js:main] Done parsing");
			});
		})
		.catch((error) => {
			console.log("[server.js:main] Error: " + error.message);
		});
}

await main("vnx", "https://vnexpress.net", "https://vnexpress.net/thoi-su", 2).then(() => {
	main("vnx", "https://vnexpress.net", "https://vnexpress.net/kinh-doanh", 2);
});

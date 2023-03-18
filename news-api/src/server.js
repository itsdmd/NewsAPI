console.log("[server.js]");

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

import { dateRouter } from "./routers/date.js";
import * as parser from "./scripts/scraper/parser.js";
import * as scraper from "./scripts/scraper/scraper.js";

const port = process.env.PORT || 3000;

async function main() {
	console.log("[server.js:main]");

	const app = express();

	app.use(express.json());
	app.use("/date", dateRouter);

	app.listen(port, () => {
		console.log("[server.js:main] Listening on port " + port);
	});
	/* #endregion */

	/* ------------ scraping ------------ */
	/* #region   */
	// await fetcher.fetchHttpText("https://vnexpress.net/thoi-su");
	scraper.scrape("vnx", "https://vnexpress.net", "https://vnexpress.net/thoi-su", 5).then(() => {
		console.log("[server.js:main] Done scraping");

		parser.parseCache();
	});
	/* #endregion */
}

main();

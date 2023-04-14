console.log("\n[server.js]");

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { dateRouter } from "./routers/date.js";
import { wordSingleRouter } from "./routers/wordSingleOcc.js";
import { wordPairRouter } from "./routers/wordPairOcc.js";

const port = process.env.PORT || 3000;

async function main() {
	const app = express();

	app.use(express.json());

	/* #region   */
	app.use("/d", dateRouter);
	app.use("/date", dateRouter);
	app.use("/word_single", wordSingleRouter);
	app.use("/ws", wordSingleRouter);
	app.use("/word_pair", wordPairRouter);
	app.use("/wp", wordPairRouter);
	/* #endregion */

	app.listen(port, () => {
		console.log("\n[server:main] Listening on port " + port);
	});
}

await main();

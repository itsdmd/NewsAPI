console.log("\n[server.js]");

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { dateRouter } from "./routers/date.js";

const port = process.env.PORT || 3000;

async function main() {
	const app = express();

	app.use(express.json());

	/* #region   */
	app.use("/d", dateRouter);
	app.use("/date", dateRouter);
	/* #endregion */

	app.listen(port, () => {
		console.log("\n[server:main] Listening on port " + port);
	});
}

await main();

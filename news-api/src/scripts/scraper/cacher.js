// Add raw html response to cache collection
console.log("\n[cacher.js]");

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import * as fetcher from "./fetcher.js";
import cacheModel from "../../models/cache.js";

dotenv.config();

if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
	console.log("\n[cacher.js] Error: DATABASE_URL is not defined.");
	process.exit(1);
}

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
console.log("\n[cacher.js] Connecting to Database.");
/* #endregion */

db.on("error", (error) => console.log("\n[cacher.js] Error connecting to database: " + error));
db.once("open", async () => {
	console.log("\n[cacher.js] Connected to Database");
});

import cliProgress from "cli-progress";
export async function cacheMany(urls, type, skipped = false) {
	// console.log("\n[cacher:cacheMany] url: " + urls + ", type: " + type);
	console.log("\n[cacher:cacheMany]");

	if (urls.length === 0 || urls === undefined || urls === null) {
		console.log("\n[cacher:cacheMany] Error: urls is undefined or null.");

		throw new Error("urls is undefined or null.");
	}

	const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
	bar.start(urls.length, 0);

	for (let url of urls) {
		// console.log("\n[cacher:cacheMany] Caching " + url);
		await cacheOne(url, type, skipped);
		bar.increment();
	}

	// console.log("\n[cacher:cache] Done.");
}

export async function cacheOne(url, type, skipped = false) {
	// console.log("\n[cacher:cacheOne] url: " + url + ", type: " + type + ", skipped: " + skipped);

	const response = await fetcher
		.fetchHttpText(url)
		.then((result) => {
			// console.log("\n[cacher:cacheOne] Fetched");
			return result;
		})
		.catch((error) => {
			console.log("\n[cacher:cacheOne] Error fetching: " + error.message);
			return;
		});

	// let result =
	await cacheModel
		.create({
			type: type,
			url: url,
			content: response,
			skipped: skipped,
		})
		// .then((result) => {
		// 	console.log("\n[cacher:cacheOne] Success. ID: " + result._id);
		// 	return result;
		// })
		.catch((error) => {
			if (error.message.includes("E11000 duplicate key error")) {
				// let id = error.message.match(/(?<=dup key: { metadata.id: ").*(?=" })/g)[0];
				// console.log("\n[cacher:cacheOne] Warning: Duplicate key: " + id);
				return;
			} else {
				console.log("\n[cacher:cacheOne] Error creating: " + error.message);
			}
			return;
		});

	return;
}

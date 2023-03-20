// Add raw html response to cache collection
console.log("[cacher.js]");

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import * as fetcher from "./fetcher.js";
import cacheModel from "../../models/cache.js";

dotenv.config();

if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
	console.log("[cacher.js] Error: DATABASE_URL is not defined.");
}

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
console.log("[cacher.js] Connecting to Database.");
/* #endregion */

db.on("error", (error) => console.log("[cacher.js] Error connecting to database: " + error));
db.once("open", async () => {
	console.log("[cacher.js] Connected to Database");
});

export async function cacheMany(urls, type, skipped = false) {
	// console.log("[cacher:cacheMany] url: " + urls + ", type: " + type);

	if (urls.length === 0 || urls === undefined || urls === null) {
		console.log("[cacher:cacheMany] Error: urls is undefined or null.");

		throw new Error("urls is undefined or null.");
	}

	for (let url of urls) {
		// console.log("[cacher:cacheMany] Caching " + url);

		await cacheOne(url, type, skipped);
	}

	console.log("[cacher:cache] Done.");
}

export async function cacheOne(url, type, skipped = false) {
	// console.log("[cacher:cacheOne] url: " + url + ", type: " + type);

	try {
		let response = await fetcher.fetchHttpText(url);
		console.log("[cacher:cacheOne] Success. URL: " + url.substring(url.lastIndexOf("-") + 1, url.lastIndexOf(".htm")));

		await cacheModel
			.create({
				type: type,
				url: url,
				content: response,
				skipped: skipped,
			})
			.then((result) => {
				return result;
			})
			.catch((error) => {
				if (error.message.includes("E11000 duplicate key error")) {
					let id = error.message.match(/(?<=dup key: { metadata.id: ").*(?=" })/g)[0];
					console.log("[cacher:cacheOne] Error: Duplicate key: " + id);
				} else {
					console.log("[cacher:cacheOne] Error: " + error.message);
				}
				return;
			});

		// console.log("[cacher:cacheOne] Success. ID: " + result._id);
		return;
	} catch (error) {
		if (error.message.includes("E11000 duplicate key error")) {
			let id = error.message.match(/(?<=dup key: { metadata.id: ").*(?=" })/g)[0];
			console.log("[cacher:cacheOne] Error: Duplicate key: " + id);
		} else {
			console.log("[cacher:cacheOne] Error: " + error.message);
		}
		return;
	}
}

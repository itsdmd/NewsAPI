// Add raw html response to cache collection
console.log("[cacher.js]");

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import * as fetcher from "./fetcher.js";
import cacheModel from "../../models/cache.js";
import vnxModal from "../../models/vnxArticle.js";

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

export async function cache(urls, type) {
	console.log("[cacher.js:cache] url: " + urls + ", type: " + type);

	for (let url of urls) {
		await addTocache(url, type);
	}

	console.log("[cacher.js:cache] Done.");
}

async function addTocache(url, type) {
	console.log("[cacher.js:addTocache] url: " + url + ", type: " + type);

	// check if url exist in database of type
	switch (type) {
		case "vnx-article": {
			if (await vnxModal.findOne({ "metadata.url": url }).countDocuments().exec()) {
				console.log("[cacher.js:addTocache] url: " + url + " already exist in database.");
				return;
			}
		}
	}

	let response = await fetcher.fetchHttpText(url);

	if (response !== undefined && response !== null) {
		try {
			let result = await cacheModel
				.create({
					type: type,
					url: url,
					content: response,
				})
				.then((result) => {
					return result;
				});

			console.log("[cacher.js:addTocache] Success. ID: " + result._id);
			return;
		} catch (error) {
			console.log("[cacher.js:addTocache] Error: " + error.message);
			return;
		}
	} else {
		console.log("[cacher.js:addTocache] Error: Null response");
		return;
	}
}

// Add raw html response to cache collection
console.log("[cacher.js]");

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import * as fetcher from "./fetcher.js";
import cacheModel from "../../models/cache.js";
import vnxVnModal from "../../models/vnxArticleVn.js";
import vnxEnModal from "../../models/vnxArticleEn.js";
import ttVnModal from "../../models/ttArticleVn.js";
import ttEnModal from "../../models/ttArticleEn.js";

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

	if (urls.length === 0 || urls === undefined || urls === null) {
		console.log("[cacher.js:cache] Error: urls is undefined or null.");

		throw new Error("urls is undefined or null.");
	}

	for (let url of urls) {
		await addToCache(url, type);
	}

	console.log("[cacher.js:cache] Done.");
}

export async function addToCache(url, type) {
	console.log("[cacher.js:addToCache] url: " + url + ", type: " + type);

	// check if url exist in database of type
	let exist = false;
	switch (type) {
		case "vnx-vn": {
			if (await vnxVnModal.findOne({ "metadata.url": url }).countDocuments().exec()) {
				console.log("[cacher.js:addToCache] url: " + url + " already exist in database.");
				exist = true;
				return;
			} else {
				break;
			}
		}

		case "vnx-en": {
			if (await vnxEnModal.findOne({ "metadata.url": url }).countDocuments().exec()) {
				console.log("[cacher.js:addToCache] url: " + url + " already exist in database.");
				exist = true;
				return;
			} else {
				break;
			}
		}

		case "tt-vn": {
			if (await ttVnModal.findOne({ "metadata.url": url }).countDocuments().exec()) {
				console.log("[cacher.js:addToCache] url: " + url + " already exist in database.");
				exist = true;
				return;
			} else {
				break;
			}
		}

		case "tt-en": {
			if (await ttEnModal.findOne({ "metadata.url": url }).countDocuments().exec()) {
				console.log("[cacher.js:addToCache] url: " + url + " already exist in database.");
				exist = true;
				return;
			} else {
				break;
			}
		}

		default: {
			console.log("[cacher.js:addToCache] Error: type is not defined.");
			return;
		}
	}

	if (exist) {
		return;
	}

	try {
		let response = await fetcher.fetchHttpText(url);

		let result = await cacheModel
			.create({
				type: type,
				url: url,
				content: response,
			})
			.then((result) => {
				return result;
			});

		console.log("[cacher.js:addToCache] Success. ID: " + result._id);
		return;
	} catch (error) {
		console.log("[cacher.js:addToCache] Error: " + error.message);
		return;
	}
}

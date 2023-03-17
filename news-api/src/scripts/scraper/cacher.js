// Add raw html response to cache collection
console.log("Starting cacher.js");

import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import model from "../../models/cache.js";

export async function cacher(urls, type) {
	if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
		console.log("[cacher.js] Error: DATABASE_URL is not defined.");
		return;
	}

	mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
	const db = mongoose.connection;
	console.log("[cacher.js] Connecting to Database.");
	db.on("error", (error) => console.error(error));
	db.once("open", async () => {
		console.log("[cacher.js] Connected to Database");

		for (let url of urls) {
			await appendToCache(url, type);
		}

		console.log("[cacher.js:cacher] Done.");
	});
}

async function appendToCache(url, type = "undefined") {
	console.log("[cacher.js:appendToCache] Fetching " + url);

	const response = await fetch(url)
		.then((response) => {
			return response.text();
		})
		.catch((error) => {
			console.log("[cacher.js:appendToCache] Error: " + error.message);
		});

	// console.log("[cacher.js:appendToCache] Response: " + response);

	if (response !== undefined && response !== null) {
		try {
			let result = await model
				.create({
					url: url,
					content: response,
					publisher: type,
				})
				.then((result) => {
					return result;
				});

			console.log("[cacher.js:appendToCache] Success. ID: " + result._id);
		} catch (error) {
			console.log("[cacher.js:appendToCache] Error: " + error.message);
		}
	} else {
		console.log("[cacher.js:appendToCache] Error: Null response");
	}
}

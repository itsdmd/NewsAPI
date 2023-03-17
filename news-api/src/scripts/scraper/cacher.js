// Add raw html response to cache collection
console.log("Starting cacher.js");

import { connect, connection } from "mongoose";
import { create } from "../models/cache";

connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("[cacher.js] Connected to Database"));

async function appendToCache(urls, type = "undefined") {
	urls.forEach(async (url) => {
		const response = await fetch(url).catch((error) => console.log(error));

		if (response.ok) {
			try {
				await create({
					url: url,
					content: response.text(),
					publisher: type,
				});
			} catch (error) {
				console.log("[cacher.js:appendToCache] Error: " + error.message);
			}
		} else {
			console.log("[cacher.js:appendToCache] Error: " + response.status);
		}
	});
}

export default appendToCache;

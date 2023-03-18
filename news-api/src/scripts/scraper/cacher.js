// Add raw html response to cache collection
console.log("[cacher.js]");

export async function cacher(urls, type) {
	/* --------- connect to dtb --------- */
	let dotenv = await import("dotenv").then((dotenv) => {
		return dotenv;
	});
	dotenv.config();
	if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
		console.error("[cacher.js] Error: DATABASE_URL is not defined.");
		return;
	}

	let mongoose = await import("mongoose").then((mongoose) => {
		return mongoose;
	});

	mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
	const db = mongoose.connection;
	console.log("[cacher.js] Connecting to Database.");

	db.on("error", (error) => console.error("[cacher.js] Error connecting to database: " + error));
	db.once("open", async () => {
		console.log("[cacher.js] Connected to Database");

		for (let url of urls) {
			await appendToCache(url, type);
		}

		console.log("[cacher.js:cacher] Done.");
	});
}

async function appendToCache(url, type = "undefined") {
	let fetcher = await import("./fetcher.js").then((fetcher) => {
		return fetcher;
	});

	let response = await fetcher.fetch(url);

	let model = await import("../../models/cache.js").then((model) => {
		return model;
	});

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
			console.error("[cacher.js:appendToCache] Error: " + error.message);
		}
	} else {
		console.error("[cacher.js:appendToCache] Error: Null response");
	}
}

// Add raw html response to cache collection
console.log("[cacher.js]");

export async function cacher(urls, type) {
	console.log("[cacher.js:cacher] url: " + urls + ", type: " + type);

	/* --------- connect to dtb --------- */
	let dotenv = await import("dotenv").then((dotenv) => {
		return dotenv;
	});
	dotenv.config();
	if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
		console.error("[cacher.js:cacher] Error: DATABASE_URL is not defined.");
		return;
	}

	let mongoose = await import("mongoose").then((mongoose) => {
		return mongoose;
	});

	mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
	const db = mongoose.connection;
	console.log("[cacher.js:cacher] Connecting to Database.");

	db.on("error", (error) => console.error("[cacher.js:cacher] Error connecting to database: " + error));
	db.once("open", async () => {
		console.log("[cacher.js:cacher] Connected to Database");

		for (let url of urls) {
			await addTocache(url, type);
		}

		console.log("[cacher.js:cacher] Done.");
	});
}

async function addTocache(url, type = "undefined") {
	console.log("[cacher.js:addTocache] url: " + url + ", type: " + type);

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

			console.log("[cacher.js:addTocache] Success. ID: " + result._id);
		} catch (error) {
			console.error("[cacher.js:addTocache] Error: " + error.message);
		}
	} else {
		console.error("[cacher.js:addTocache] Error: Null response");
	}
}

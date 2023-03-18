// Add new article to database
console.log("[transactor.js]");

export async function addvnxArticle(article) {
	console.log("[transactor.js:addvnxArticle]");

	let dotenv = await import("dotenv").then((dotenv) => {
		return dotenv;
	});
	dotenv.config();
	if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
		console.error("[transactor.js:addvnxArticle] Error: DATABASE_URL is not defined.");
		return;
	}

	let mongoose = await import("mongoose").then((mongoose) => {
		return mongoose;
	});

	mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
	const db = mongoose.connection;
	console.log("[transactor.js:addvnxArticle] Connecting to Database.");

	db.on("error", (error) => console.error("[transactor.js:addvnxArticle] Error connecting to database: " + error));
	db.once("open", async () => {
		console.log("[transactor.js] Connected to Database");

		try {
			let model = await import("../models/vnxArticle.js").then((model) => {
				return model;
			});

			await model.create(article).then((result) => {
				console.log("[transactor.js:addvnxArticle] Success. ID: " + result._id);
			});
		} catch (error) {
			console.error("[transactor.js:addvnxArticle] Error: " + error.message);
		}
	});
}

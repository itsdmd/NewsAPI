// Add new article to database
console.log("[transactor.js]");

export async function addVnExpressArticle(article) {
	let dotenv = await import("dotenv").then((dotenv) => {
		return dotenv;
	});
	dotenv.config();
	if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === "") {
		console.error("[transactor.js] Error: DATABASE_URL is not defined.");
		return;
	}

	let mongoose = await import("mongoose").then((mongoose) => {
		return mongoose;
	});

	mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
	const db = mongoose.connection;
	console.log("[transactor.js] Connecting to Database.");

	db.on("error", (error) => console.error("[transactor.js] Error connecting to database: " + error));
	db.once("open", async () => {
		console.log("[transactor.js] Connected to Database");

		try {
			let model = await import("../models/vnexpressArticle.js").then((model) => {
				return model;
			});

			await model.create(article).then((result) => {
				console.log("[transactor.js:addVnExpressArticle] Success. ID: " + result._id);
			});
		} catch (error) {
			console.error("[transactor.js:addVnExpressArticle] Error: " + error.message);
		}
	});
}

// Add new article to database
console.log("Starting transactor.js");

require("dotenv").config();

import mongoose from "mongoose";

import { model } from "../models/vnexpressArticle.js";

export async function addVnExpressArticle(article) {
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

		try {
			await model.create(article).then((result) => {
				console.log("[transactor.js:addVnExpressArticle] Success. ID: " + result._id);
			});
		} catch (error) {
			console.log("[transactor.js:addVnExpressArticle] Error: " + error.message);
		}
	});
}

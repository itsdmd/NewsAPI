// Add new article to database
console.log("[transactor.js]");

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import ttVnModel from "../../models/ttArticleVn.js";
import tnVnModel from "../../models/tnArticleVn.js";

dotenv.config();
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
console.log("[transactor:addVnxArticle] Connecting to Database.");

db.on("error", (error) => console.log("[transactor:addVnxArticle] Error connecting to database: " + error));
db.once("open", async () => {
	console.log("[transactor.js] Connected to Database");
});

export async function addTtVnArticle(article) {
	// console.log("[transactor:addTtVnArticle]");

	try {
		await ttVnModel.create(article).then((result) => {
			// console.log("[transactor:addTtVnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		if (error.message.includes("E11000 duplicate key error")) {
			let id = error.message.match(/(?<=dup key: { metadata.id: ").*(?=" })/g)[0];
			// console.log("[transactor:addTtVnArticle] Warning: Duplicate key: " + id);
		} else {
			console.log("[cacher:cacheOne] Error: " + error.message);
		}
		return;
	}
}

export async function addTnVnArticle(article) {
	// console.log("[transactor:addTtVnArticle]");

	try {
		await tnVnModel.create(article).then((result) => {
			// console.log("[transactor:addTtVnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		if (error.message.includes("E11000 duplicate key error")) {
			let id = error.message.match(/(?<=dup key: { metadata.id: ").*(?=" })/g)[0];
			// console.log("[transactor:addTtVnArticle] Warning: Duplicate key: " + id);
		} else {
			console.log("[cacher:cacheOne] Error: " + error.message);
		}
		return;
	}
}

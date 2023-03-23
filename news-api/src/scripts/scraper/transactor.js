// Add new article to database
console.log("\n[transactor.js]");

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import ttVnModel from "../../models/ttArticleVn.js";
import tnVnModel from "../../models/tnArticleVn.js";

dotenv.config();
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
console.log("\n[transactor] Connecting to Database.");

db.on("error", (error) => console.log("\n[transactor] Error connecting to database: " + error));
db.once("open", async () => {
	console.log("\n[transactor] Connected to Database");
});

export async function addTtVnArticle(article) {
	// console.log("\n[transactor:addTtVnArticle]");

	try {
		await ttVnModel.create(article).then((result) => {
			// console.log("\n[transactor:addTtVnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		if (error.message.includes("E11000 duplicate key error")) {
			let id = error.message.match(/(?<=dup key: { metadata.id: ").*(?=" })/g)[0];
			// console.log("\n[transactor:addTtVnArticle] Warning: Duplicate key: " + id);
		} else {
			console.log("\n[transactor:addTtVnArticle] Error: " + error.message);
		}
		return;
	}
}

export async function addTnVnArticle(article) {
	// console.log("\n[transactor:addTtVnArticle]");

	try {
		await tnVnModel.create(article).then((result) => {
			// console.log("\n[transactor:addTtVnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		if (error.message.includes("E11000 duplicate key error")) {
			let id = error.message.match(/(?<=dup key: { metadata.id: ").*(?=" })/g)[0];
			// console.log("\n[transactor:addTtVnArticle] Warning: Duplicate key: " + id);
		} else {
			console.log("\n[transactor:addTnVnArticle] Error: " + error.message);
		}
		return;
	}
}

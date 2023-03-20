// Add new article to database
console.log("[transactor.js]");

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import vnxVnModel from "../../models/vnxArticleVn.js";
import vnxEnModel from "../../models/vnxArticleEn.js";
import ttVnModel from "../../models/ttArticleVn.js";
import ttEnModel from "../../models/ttArticleEn.js";

dotenv.config();
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
console.log("[transactor:addVnxArticle] Connecting to Database.");

db.on("error", (error) => console.log("[transactor:addVnxArticle] Error connecting to database: " + error));
db.once("open", async () => {
	console.log("[transactor.js] Connected to Database");
});

export async function addVnxVnArticle(article) {
	// console.log("[transactor:addVnxVnArticle]");

	try {
		await vnxVnModel.create(article).then((result) => {
			console.log("[transactor:addVnxVnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		console.log("[transactor:addVnxVnArticle] Error: " + error.message);
		return;
	}
}

export async function addVnxEnArticle(article) {
	// console.log("[transactor:addVnxEnArticle]");

	try {
		await vnxEnModel.create(article).then((result) => {
			// console.log("[transactor:addVnxEnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		if (error.message.includes("E11000 duplicate key error")) {
			console.log("[cacher:cacheOne] Error: Duplicate key.");
		} else {
			console.log("[cacher:cacheOne] Error: " + error.message);
		}
		return;
	}
}

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
			console.log("[cacher:cacheOne] Error: Duplicate key: " + id);
		} else {
			console.log("[cacher:cacheOne] Error: " + error.message);
		}
		return;
	}
}

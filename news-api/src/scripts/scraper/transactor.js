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
console.log("[transactor.js:addVnxArticle] Connecting to Database.");

db.on("error", (error) => console.log("[transactor.js:addVnxArticle] Error connecting to database: " + error));
db.once("open", async () => {
	console.log("[transactor.js] Connected to Database");
});

export async function addVnxVnArticle(article) {
	console.log("[transactor.js:addVnxVnArticle]");

	try {
		await vnxVnModel.create(article).then((result) => {
			console.log("[transactor.js:addVnxVnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		console.log("[transactor.js:addVnxVnArticle] Error: " + error.message);
		return;
	}
}

export async function addVnxEnArticle(article) {
	console.log("[transactor.js:addVnxEnArticle]");

	try {
		await vnxEnModel.create(article).then((result) => {
			console.log("[transactor.js:addVnxEnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		console.log("[transactor.js:addVnxEnArticle] Error: " + error.message);
		return;
	}
}

export async function addTtVnArticle(article) {
	console.log("[transactor.js:addTtVnArticle]");

	try {
		await ttVnModel.create(article).then((result) => {
			console.log("[transactor.js:addTtVnArticle] Success. ID: " + result._id);
		});
		return;
	} catch (error) {
		console.log("[transactor.js:addTtVArticle] Error: " + error.message);
		return;
	}
}

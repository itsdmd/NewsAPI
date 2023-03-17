// Add new article to database
console.log("Starting transactor.js");

require("dotenv").config();

import mongoose from "mongoose";

import { model } from "../models/vnexpressArticle.js";

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("[transactor.js] Connected to Database"));

export async function addVnExpressArticle(article) {
	try {
		await model.create(article).then((result) => {
			console.log("[transactor.js:addVnExpressArticle] Success. ID: " + result._id);
		});
	} catch (error) {
		console.log("[transactor.js:addVnExpressArticle] Error: " + error.message);
	}
}

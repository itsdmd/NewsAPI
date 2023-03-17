// Add new article to database
console.log("Starting transactor.js");

import { connect, connection } from "mongoose";

import { create } from "../models/vnexpressArticle";

connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("[transactor.js] Connected to Database"));

async function addVnExpressArticle(article) {
	try {
		await create(article).then((result) => {
			console.log("[transactor.js:addVnExpressArticle] Success. ID: " + result._id);
		});
	} catch (error) {
		console.log("[transactor.js:addVnExpressArticle] Error: " + error.message);
	}
}

export default addVnExpressArticle;

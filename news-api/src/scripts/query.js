// Query the database

import * as dotenv from "dotenv";
import mongoose from "mongoose";

// import ttVnModel from "../models/ttArticleVn.js";
import tnVnModel from "../models/tnArticleVn.js";

dotenv.config();
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
console.log("\n[query] Connecting to Database.");

db.on("error", (error) => console.log("\n[transactor] Error connecting to database: " + error));
db.once("open", async () => {
	console.log("\n[query] Connected to Database");
});

const limit = 10;
export async function query(input, filter = { _id: 0, content: 0 }, offset = 0) {
	const result = await tnVnModel
		.find(input, filter)
		.sort("metadata.pubdate.isodate")
		.skip(offset * limit)
		.limit(limit);
	return result;
}

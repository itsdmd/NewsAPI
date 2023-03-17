const mongoose = require("mongoose");

const VnExpressArticle = require("../models/article");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => {
	console.log("Connected to Database");
});

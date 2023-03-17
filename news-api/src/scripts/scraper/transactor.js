const mongoose = require("mongoose");

const VnExpressArticle = require("../models/article");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

async function addVnExpressArticle(article) {
	try {
		await VnExpressArticle.create(article).then((result) => {
			console.log("[fn:addVnExpressArticle] Success. ID: " + result._id);
		});
	} catch (error) {
		console.log("[fn:addVnExpressArticle] Error: " + error.message);
	}
}

module.exports = addVnExpressArticle;

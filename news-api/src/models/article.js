const mongoose = require("mongoose");

const vnexpressArticleSchema = new mongoose.Schema({
	metadata: {
		url: {
			type: String,
			required: true,
		},
		categories: [
			{
				name: [String],
				url: [String],
			},
		],
		tags: [
			{
				name: [String],
				url: [String],
			},
		],
		publishedDate: {
			type: Date,
			required: true,
		},
		authors: [{ type: String }],
	},
	contentBlocks: [
		{
			tag: {
				type: String,
				enum: ["a", "div", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6", "img", "p"],
				required: true,
			},
			class: {
				type: String,
				enum: ["description", "normal", "title", ""],
				required: true,
			},
			content: {
				type: String,
				required: true,
			},
		},
	],
	comments: [
		{
			author: {
				username: {
					type: String,
				},
				url: {
					type: String,
				},
			},
			url: {
				type: String,
			},
			content: {
				type: String,
			},
			createdAt: {
				type: Date,
			},
			likes: {
				type: Number,
			},
		},
	],
});

module.exports = mongoose.model("VnExpressArticle", vnexpressArticleSchema);

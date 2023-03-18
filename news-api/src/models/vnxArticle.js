import mongoose from "mongoose";

const vnxArticleSchema = new mongoose.Schema({
	metadata: {
		id: {
			type: String,
			required: true,
			unique: true,
		},
		type: {
			type: String,
		},
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		keywords: [
			{
				type: String,
			},
		],
		folder: [
			{
				id: {
					type: String,
				},
				name: {
					type: String,
				},
			},
		],
		tags: [
			{
				url: {
					type: String,
				},
				name: {
					type: String,
				},
			},
		],
		published_date: {
			type: Date,
		},
		authors: [
			{
				type: String,
			},
		],
	},
	content_blocks: [
		{
			tag: {
				type: String,
			},
			content: {
				type: String,
			},
			attributes: {
				type: JSON,
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
				avatar: {
					type: String,
				},
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

module.exports = mongoose.model("vnxArticle", vnxArticleSchema, "vnx_articles");

import { Schema, model } from "mongoose";

const vnxVnArticleSchema = new Schema({
	metadata: {
		id: {
			type: String,
			required: true,
			unique: true,
		},
		url: {
			type: String,
			required: true,
			unique: true,
		},
		type: {
			type: String,
		},
		category: {
			type: String,
		},
		title: {
			type: String,
			required: true,
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
				type: String,
			},
		],
		published_date: {
			type: Date,
			required: true,
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
});

export default model("vnxVnArticle", vnxVnArticleSchema, "vnx_vn_articles");

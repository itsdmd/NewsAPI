import { Schema, model } from "mongoose";

const ttVnArticleSchema = new Schema({
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
		tags: [
			{
				title: {
					type: String,
				},
				url: {
					type: String,
				},
			},
		],
		publish_date: {
			type: Date,
			required: true,
		},
		authors: [
			{
				title: {
					type: String,
				},
				url: {
					type: String,
				},
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

export default model("ttVnArticle", ttVnArticleSchema, "tt_vn_articles");

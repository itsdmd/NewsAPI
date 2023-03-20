import { Schema, model } from "mongoose";

const tnVnArticleSchema = new Schema({
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
	content: [
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

export default model("tnVnArticle", tnVnArticleSchema, "tn_vn_articles");

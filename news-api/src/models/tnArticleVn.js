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
			year: {
				type: Number,
			},
			month: {
				type: Number,
			},
			day: {
				type: Number,
			},
			hour: {
				type: Number,
			},
			minute: {
				type: Number,
			},
		},
		authors: [
			{
				name: {
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
			type: {
				type: String,
				enum: ["text", "texta", "image", "video", "audio", "iframe", "quote", "highlight"], // texta: text with attributes
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

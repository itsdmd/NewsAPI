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
		},
		categories: [
			{
				title: {
					type: String,
				},
				id: {
					type: String,
				},
			},
		],
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		pubdate: {
			year: {
				type: String,
			},
			month: {
				type: String,
			},
			day: {
				type: String,
			},
			hour: {
				type: String,
			},
			minute: {
				type: String,
			},
			isodate: {
				type: Date,
				default: function () {
					return Date(
						this.metadata.pubdate.year +
							"-" +
							this.metadata.pubdate.month +
							"-" +
							this.metadata.pubdate.day +
							"T" +
							this.metadata.pubdate.hour +
							":" +
							this.metadata.pubdate.minute +
							":00+07:00"
					);
				},
			},
		},
		authors: [
			{
				name: {
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

export default model("vnxVnArticle", vnxVnArticleSchema, "vnx_vn_articles");

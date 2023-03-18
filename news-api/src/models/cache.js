import { Schema, model } from "mongoose";

const cacheSchema = new Schema({
	type: {
		type: String,
		enum: [
			"vnx-article", // Article website
			"vnx-feed", // Feed website (list of articles)
			"undefined",
		],
		default: "undefined",
	},
	url: {
		type: String,
		required: true,
		unique: true,
	},
	content: {
		type: String,
		required: true,
	},
	created_at: {
		type: Date,
		immutable: true,
		default: () => Date.now(),
	},
});

export default model("cache", cacheSchema, "cache");

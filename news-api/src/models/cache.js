import { Schema, model } from "mongoose";

const cacheSchema = new Schema({
	type: {
		type: String,
		enum: ["vnexpress-article", "vnexpress-category", "vnexpress-tag", "undefined"],
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

export default model("Cache", cacheSchema, "cache");

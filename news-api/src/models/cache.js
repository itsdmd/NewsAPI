import { Schema, model } from "mongoose";

const cacheSchema = new Schema({
	type: {
		type: String,
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
	skipped: {
		type: Boolean,
		default: false,
	},
});

export default model("cache", cacheSchema, "cache");

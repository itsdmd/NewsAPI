import { Schema, model } from "mongoose";

const downloadedImages = new Schema({
	parent_url: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
		unique: true,
	},
});

export default model("downloadedImages", downloadedImages, "downloaded_images");

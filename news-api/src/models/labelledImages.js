import { Schema, model } from "mongoose";

const labelledImages = new Schema({
	url: {
		type: String,
		required: true,
		unique: true,
	},
});

export default model("labelledImages", labelledImages, "labelled_images");

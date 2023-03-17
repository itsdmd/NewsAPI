const mongoose = require("mongoose");

const cacheSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true,
	}
});

module.exports = mongoose.model("Cache", cacheSchema);
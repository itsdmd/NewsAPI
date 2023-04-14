import express from "express";
import { python } from "pythonia";

import { dateStringToObj } from "./date.js";

const wo = await python("../scripts/analyzer/word_occurence.py");

export const wordSingleRouter = express.Router();

wordSingleRouter.get("/", (req, res) => {
	res.status(400).json({ error: "Missing parameters" });
});

wordSingleRouter.get("/:date", async (req, res) => {
	try {
		let dateObj = null;
		try {
			dateObj = dateStringToObj(req.params.date);
		} catch (e) {
			return res.status(400).json({ error: e.message });
		}

		const filter = [];
		filter.push({ "metadata.pubdate.day": dateObj["metadata.pubdate.day"] });
		filter.push({ "metadata.pubdate.month": dateObj["metadata.pubdate.month"] });
		filter.push({ "metadata.pubdate.year": dateObj["metadata.pubdate.year"] });

		const allWordsTT = await wo.get_all_words("TT", filter);
		const allWordsTN = await wo.get_all_words("TN", filter);
		const allWordsVNX = await wo.get_all_words("VNX", filter);

		const allWords = [];
		for (let i = 0; i < (await allWordsTT.length); i++) {
			allWords.push(await allWordsTT[i]);
		}
		for (let i = 0; i < (await allWordsTN.length); i++) {
			allWords.push(await allWordsTN[i]);
		}
		for (let i = 0; i < (await allWordsVNX.length); i++) {
			allWords.push(await allWordsVNX[i]);
		}

		const result = JSON.parse(await wo.get_word_single_occ(allWordsTT, "json", 50));
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

import express from "express";
import moment from "moment";
import * as query from "../scripts/query.js";

export const dateRouter = express.Router();
const fieldRouter = express.Router({ mergeParams: true });

export function dateStringToObj(input) {
	/* -------------- date -------------- */
	const splittedDate = input.split("-");
	if (splittedDate.length != 3) {
		throw new Error("Invalid date");
	}

	const year = splittedDate[0];
	const month = splittedDate[1];
	const day = splittedDate[2];

	// check date validity
	const yearForCheck = year === "*" ? "2023" : year;
	const monthForCheck = month === "*" ? "01" : month;
	const dayForCheck = day === "*" ? "01" : day;
	const dateForCheck = yearForCheck + "-" + monthForCheck + "-" + dayForCheck;
	if (!moment(dateForCheck, "YYYY-MM-DD", true).isValid()) {
		throw new Error("Invalid date");
	}

	let resultObj = {
		"metadata.pubdate.year": year === "*" ? { $exists: true } : year,
		"metadata.pubdate.month": month === "*" ? { $exists: true } : month,
		"metadata.pubdate.day": day === "*" ? { $exists: true } : day,
	};

	return resultObj;
}

function fieldStringToObj(input) {
	let separator = input.includes("%2B") ? "%2B" : "+";

	let splittedFilter = input.split(separator);
	let fieldObj = { _id: 0 };

	splittedFilter.forEach((field) => {
		field = field.replace("_", ".");
		field = "metadata." + field;

		fieldObj[field] = 1;
	});

	return fieldObj;
}

/* ---------------------------------- */
/*             dateRouter             */
/* ---------------------------------- */

dateRouter.get("/", (req, res) => {
	res.status(400).json({ error: "Missing date" });
});

dateRouter.use("/:date/f", fieldRouter);
dateRouter.use("/:date/fields", fieldRouter);
dateRouter.get("/:date", async (req, res) => {
	try {
		let dateObj = null;
		try {
			dateObj = dateStringToObj(req.params.date);
		} catch (e) {
			return res.status(400).json({ error: e.message });
		}
		const result = await query.query(dateObj, { _id: 0, content: 0, __v: 0 });
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
dateRouter.get("/:date/:offset", async (req, res) => {
	try {
		let dateObj = null;
		try {
			dateObj = dateStringToObj(req.params.date);
		} catch (e) {
			return res.status(400).json({ error: e.message });
		}
		const result = await query.query(dateObj, { _id: 0, content: 0, __v: 0 }, parseInt(req.params.offset));
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ---------------------------------- */
/*             fieldRouter            */
/* ---------------------------------- */

fieldRouter.get("/", (req, res) => {
	res.status(400).json({ error: "Missing fields" });
});

fieldRouter.get("/:fields", async (req, res) => {
	try {
		let dateObj = null;
		try {
			dateObj = dateStringToObj(req.params.date);
		} catch (e) {
			return res.status(400).json({ error: e.message });
		}
		const result = await query.query(dateObj, fieldStringToObj(req.params.fields), 0);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

fieldRouter.get("/:fields/:offset", async (req, res) => {
	try {
		let dateObj = null;
		try {
			dateObj = dateStringToObj(req.params.date);
		} catch (e) {
			return res.status(400).json({ error: e.message });
		}
		const result = await query.query(dateObj, fieldStringToObj(req.params.fields), parseInt(req.params.offset));
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

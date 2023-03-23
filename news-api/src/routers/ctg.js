import express from "express";

import * as query from "../scripts/query.js";

export const ctgRouter = express.Router();

ctgRouter.get("/", (req, res) => {
	res.send("ctgRouter loaded");
});

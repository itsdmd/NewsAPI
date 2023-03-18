import express from "express";

export const dateRouter = express.Router();

dateRouter.get("/", (req, res) => {
	res.send("Hello World");
});

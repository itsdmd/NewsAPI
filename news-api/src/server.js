require("dotenv").config();

import express, { json } from "express";
const app = express();
import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("[server.js] Connected to Database"));

app.use(json());

import dateRouter from "./routes/date";
app.use("/date", dateRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log("Listening on port " + port);
});

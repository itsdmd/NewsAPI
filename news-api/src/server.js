require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(express.json());

const dateRouter = require("./routes/date");
app.use("/date", dateRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log("Listening on port " + port);
});

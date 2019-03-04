"use strict";

const path = require("path");

const config = require("config");
const pkg = require("./package.json");
config.name = pkg.name;
config.version = pkg.version;

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.static("./public"));

app.get("/", (req, res) => {
	const sessionId = req.cookies.sessionId || Date.now();
	if (!req.cookies.sessionId) {
		res.cookie("sessionId", sessionId);
	}
	const viewModel = {
		sessionId: sessionId,
		name: config.name,
		version: config.version
	};
	res.render("index", viewModel);
});

const bodyParser = require("body-parser");
app.post("/", bodyParser.urlencoded(), (req, res) => {
	const body = (req.body || {});
	const viewModel = {
		sessionId: req.cookies.sessionId,
		name: config.name,
		version: config.version,
		value1: body.value1 || "",
		value2: body.value2 || ""
	};
	res.render("index", viewModel);
});

const hogan = require("hogan-express");
app.engine("html", hogan);
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "html");
app.enable("view cache");

const server = app.listen(config.port, () => {
	console.log("Server listening on port:", server.address().port);
});

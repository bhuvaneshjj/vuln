"use strict";

const DEFAULT_PORT = 8000;

const utilities = {
	getConfiguration: (port) => {
		const config = require("config");
		const pkg = require("./package.json");

		config.name = pkg.name;
		config.version = pkg.version;
		config.port = port || DEFAULT_PORT;

		return config;
	},
	configureExpress: () => {
		const express = require("express");
		const app = express();

		return {
			express,
			app
		};
	},
	configureHogan: (app) => {
		const hogan = require("hogan-express");
		const path = require("path");

		app.engine("html", hogan);
		app.set("views", path.join(__dirname, "./views"));
		app.set("view engine", "html");
		app.enable("view cache");
	},
	configureRoutes: (config, express, app) => {
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
		app.post("/", bodyParser.urlencoded({extended: true}), (req, res) => {
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
	},
	startServer: (config, app) => {
		const server = app.listen(config.port, () => {
			console.log(`Server listening on port: ${server.address().port}`);
		});

		return server;
	}
};

const application = {
	start: (port) => {
		const config = utilities.getConfiguration(port);
		const { express, app } = utilities.configureExpress();
		utilities.configureHogan(app);
		utilities.configureRoutes(config, express, app);
		return utilities.startServer(config, app);
	},
	utilities: utilities
};

if (require.main === module) {
	const args = process.argv.slice(2);
	const port = (args.length >= 1 ? args[0] : undefined);

	application.start(port);
} else {
	module.exports = application;
}

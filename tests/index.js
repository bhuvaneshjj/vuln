const exec = require('child_process').exec;
const path = require('path');

const chai = require('chai');
const expect = require('chai').expect;

const spies = require('chai-spies');
chai.use(spies);

const application = require('../index');

const SERVER_START_TIMEOUT = 1000;

describe('vulnerable web application', () => {

	beforeEach(() => {
		chai.spy.on(console, 'log');
	});

	afterEach(() => {
		chai.spy.restore(console, 'log');
	});

	describe('get configuration', () => {

		it('should have default port', () => {
			const results = application.utilities.getConfiguration();
			const pkg = require("../package.json");

			expect(results.name).to.equal(pkg.name);
			expect(results.version).to.equal(pkg.version);
			expect(results.port).to.equal(8000);
		});

		it('should have port from argument', () => {
			const results = application.utilities.getConfiguration(123);
			const pkg = require("../package.json");

			expect(results.name).to.equal(pkg.name);
			expect(results.version).to.equal(pkg.version);
			expect(results.port).to.equal(123);
		});

	});

	describe('configure express', () => {

		it('should have express and app objects', () => {
			const results = application.utilities.configureExpress();

			expect(results.express).to.not.be.null;
			expect(results.app).to.not.be.null;
		});

	});

	describe('configure hogan', () => {

		it('should have view settings', () => {
			const { app } = application.utilities.configureExpress();
			application.utilities.configureHogan(app);

			expect(app.get("views")).to.include("/views");
			expect(app.get("view engine")).to.equal("html");
			expect(app.enabled("view cache")).to.be.true;
		});

	});

	describe('configure routes', () => {

		it('should have get and post routes', () => {
			const config = application.utilities.getConfiguration();
			const { express, app } = application.utilities.configureExpress();
			application.utilities.configureRoutes(config, express, app);

			// TODO: how to test the routes are configured???
		});
	});

	describe('start server', () => {

		it('should output listening message', (done) => {
			const config = application.utilities.getConfiguration();
			const { express, app } = application.utilities.configureExpress();
			application.utilities.configureRoutes(config, express, app);
			const server = application.utilities.startServer(config, app);

			setTimeout(() => {
				expect(server.listening).to.be.true;
				expect(console.log).to.have.been.called.with(`Server listening on port: 8000`);

				server.close();
				done();
			}, SERVER_START_TIMEOUT);
		});
	});

	describe('application start', () => {

		it('should output listening message with defaylt port', (done) => {
			const server = application.start();

			setTimeout(() => {
				expect(server.listening).to.be.true;
				expect(console.log).to.have.been.called.with(`Server listening on port: 8000`);

				server.close();
				done();
			}, SERVER_START_TIMEOUT);
		});

		it('should output listening message with argument port', (done) => {
			const server = application.start(8081);

			setTimeout(() => {
				expect(server.listening).to.be.true;
				expect(console.log).to.have.been.called.with(`Server listening on port: 8081`);

				server.close();
				done();
			}, SERVER_START_TIMEOUT);
		});
	});

	describe('run server as process', () => {

		it('should output listening message with default port', (done) => {
			const cliFullPath = path.resolve(`${__dirname}/../index.js`);
			exec(`node "${cliFullPath}"`, { timeout: SERVER_START_TIMEOUT }, (err, stdout, stderr) => {
				console.log(stdout);
				expect(err).to.not.be.null;
				expect(stdout).to.include('Server listening on port: 8000');
				expect(stderr).to.be.empty;
				done();
			});
		});

		it('should output listening message with argument port', (done) => {
			const cliFullPath = path.resolve(`${__dirname}/../index.js`);
			exec(`node "${cliFullPath}" 8081`, { timeout: SERVER_START_TIMEOUT }, (err, stdout, stderr) => {
				console.log(stdout);
				expect(err).to.not.be.null;
				expect(stdout).to.include('Server listening on port: 8081');
				expect(stderr).to.be.empty;
				done();
			});
		});
	});

});

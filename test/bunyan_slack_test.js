var request = require('request'),
sinon       = require('sinon'),
expect      = require('expect.js'),
Bunyan      = require("bunyan"),
BunyanSlack = require('../lib/bunyan-slack');

describe("bunyan-slack", function() {

	describe("logger arguments", function() {

		var sandbox;
		before(function(){
			sandbox = sinon.sandbox.create();
			sandbox.stub(request, "post");
		});

		after(function(){
			sandbox.restore();
		});

		it("should require a webhook", function() {});

		it("should take a single string", function(){

			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'webhook'
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						channel: "#general",
						username: "Bunyan Slack",
						icon_emoji: ":scream_cat:",
						text: "[INFO] foobar"
					}),
					url: "webhook"
			};

			log.info("foobar");
			sinon.assert.calledWith(request.post, expectedResponse);
		});


	});






});



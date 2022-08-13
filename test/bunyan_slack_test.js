var util = require('util'),
	sinon = require('sinon'),
	expect = require('chai').expect,
	Bunyan = require('bunyan'),
	BunyanSlack = require('../lib/bunyan-slack'),
	sandbox,
	errorHandler,
	fetch;

describe('bunyan-slack', function () {
	beforeEach(function () {
		sandbox = sinon.sandbox.create();
		errorHandler = sandbox.spy();
		fetch = sandbox.stub().returns(Promise.resolve());
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('constructor', function () {
		it('should require a webhook', function () {
			expect(function () {
				Bunyan.createLogger({
					name: 'myapp',
					stream: new BunyanSlack({}),
					level: 'info',
					fetch
				});
			}).to.throw(/webhook url cannot be null/);
		});

		it('should set options', function () {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					channel: '#bunyan-slack',
					username: '@sethpollack',
					icon_emoji: ':smile:',
					icon_url:
						'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
					fetch
				}),
				level: 'info'
			});

			var expectedResponse = {
				body: JSON.stringify({
					channel: '#bunyan-slack',
					username: '@sethpollack',
					icon_url:
						'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
					icon_emoji: ':smile:',
					text: '[INFO] foobar'
				}),
				method: 'post'
			};

			log.info('foobar');
			sinon.assert.calledWith(fetch, 'mywebhookurl', expectedResponse);
		});

		it('should use the custom formatter', function () {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					customFormatter: function (record, levelName) {
						return {
							attachments: [
								{
									fallback: 'Required plain-text summary of the attachment.',
									color: '#36a64f',
									pretext:
										'Optional text that appears above the attachment block',
									author_name: 'Seth Pollack',
									author_link: 'http://sethpollack.net',
									author_icon:
										'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
									title: 'Slack API Documentation',
									title_link: 'https://api.slack.com/',
									text: 'Optional text that appears within the attachment',
									fields: [
										{
											title: 'We have a new ' + levelName + ' log',
											value: ':scream_cat: ' + record.msg,
											short: true
										}
									]
								}
							]
						};
					},
					fetch
				}),
				level: 'info'
			});

			var expectedResponse = {
				body: JSON.stringify({
					attachments: [
						{
							fallback: 'Required plain-text summary of the attachment.',
							color: '#36a64f',
							pretext: 'Optional text that appears above the attachment block',
							author_name: 'Seth Pollack',
							author_link: 'http://sethpollack.net',
							author_icon:
								'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
							title: 'Slack API Documentation',
							title_link: 'https://api.slack.com/',
							text: 'Optional text that appears within the attachment',
							fields: [
								{
									title: 'We have a new info log',
									value: ':scream_cat: foobar',
									short: true
								}
							]
						}
					]
				}),
				method: 'post'
			};

			log.info('foobar');
			sinon.assert.calledWith(fetch, 'mywebhookurl', expectedResponse);
		});
	});

	describe('error handler', function () {
		it('should use error handler', function (done) {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack(
					{
						webhook_url: 'mywebhookurl',
						customFormatter: function (record, levelName) {
							return record.foo();
						},
						fetch
					},
					function (error) {
						expect(error).to.instanceof(TypeError);
						done();
					}
				),
				level: 'info'
			});
			log.info('foobar');
		});

		it('should use request error handler', function (done) {
			fetch.returns(Promise.reject('FAKE ERROR'));
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack(
					{
						webhook_url: 'mywebhookurl',
						fetch
					},
					function (error) {
						expect(error).to.eql('FAKE ERROR');
						done();
					}
				),
				level: 'info'
			});
			log.info('foobar');
		});
	});

	describe('loggger arguments', function () {
		it('should accept a single string argument', function () {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					fetch
				}),
				level: 'info'
			});

			var expectedResponse = {
				body: JSON.stringify({
					text: '[INFO] foobar'
				}),
				method: 'post'
			};

			log.info('foobar');
			sinon.assert.calledWith(fetch, 'mywebhookurl', expectedResponse);
		});

		it('should accept a single object argument', function () {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					customFormatter: function (record, levelName) {
						return {
							text: util.format(
								'[%s] %s',
								levelName.toUpperCase(),
								record.error
							)
						};
					},
					fetch
				}),
				level: 'info'
			});

			var expectedResponse = {
				method: 'post',
				body: JSON.stringify({
					text: '[INFO] foobar'
				})
			};

			log.info({error: 'foobar'});
			sinon.assert.calledWith(fetch, 'mywebhookurl', expectedResponse);
		});

		it('should accept an object and string as arguments', function () {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					customFormatter: function (record, levelName) {
						return {
							text: util.format(
								'[%s] %s & %s',
								levelName.toUpperCase(),
								record.error,
								record.msg
							)
						};
					},
					fetch
				}),
				level: 'info'
			});

			var expectedResponse = {
				body: JSON.stringify({
					text: '[INFO] this is the error & this is the message'
				}),
				method: 'post'
			};
			log.info({error: 'this is the error'}, 'this is the message');
			sinon.assert.calledWith(fetch, 'mywebhookurl', expectedResponse);
		});
	});
});

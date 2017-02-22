var request = require('request'),
util        = require('util'),
sinon       = require('sinon'),
expect      = require('chai').expect,
Bunyan      = require('bunyan'),
BunyanSlack = require('../lib/bunyan-slack'),
sandbox,
errorHandler;

describe('bunyan-slack', function() {
	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		errorHandler = sandbox.spy();
		sandbox.stub(request, 'post').returns({
			on: errorHandler
		});
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('constructor', function() {
		it('should require a webhook', function() {
			expect(function() {
				Bunyan.createLogger({
					name: 'myapp',
					stream: new BunyanSlack({}),
					level: 'info'
				});
			}).to.throw(/webhook url cannot be null/);
		});

		it('should set options', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					channel: '#bunyan-slack',
					username: '@sethpollack',
					icon_emoji: ':smile:',
					icon_url: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200'
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						channel: '#bunyan-slack',
						username: '@sethpollack',
						icon_url: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
						icon_emoji: ':smile:',
						text: '[INFO] foobar'
					}),
					url: 'mywebhookurl'
			};
			log.info('foobar');
			sinon.assert.calledWith(request.post, expectedResponse);
		});

		it('should only deliver last message if there is a message burst', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					channel: '#bunyan-slack',
					username: '@sethpollack',
					icon_emoji: ':smile:',
					icon_url: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
					rate_limit_interval: 1000
				}),
				level: 'info'
			});

			var expectedResponse = {
				body: JSON.stringify({
					channel: '#bunyan-slack',
					username: '@sethpollack',
					icon_url: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
					icon_emoji: ':smile:',
					text: '[INFO] foobar 999'
				}),
				url: 'mywebhookurl'
			};

			for(var i=0; i>1000; i++) {
				log.info('foobar ' + i);
			}

			setTimeout(function() {
				sinon.assert.calledWith(request.post, expectedResponse);
			}, 1000);

		});

		it('should use the custom formatter', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					customFormatter: function(record, levelName) {
						return {
								attachments: [{
										fallback: 'Required plain-text summary of the attachment.',
										color: '#36a64f',
										pretext: 'Optional text that appears above the attachment block',
										author_name: 'Seth Pollack',
										author_link: 'http://sethpollack.net',
										author_icon: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
										title: 'Slack API Documentation',
										title_link: 'https://api.slack.com/',
										text: 'Optional text that appears within the attachment',
										fields: [{
												title: 'We have a new ' + levelName + ' log',
												value: ':scream_cat: ' + record.msg,
												short: true
										}]
								}]
						};
					}
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						attachments: [{
							fallback: 'Required plain-text summary of the attachment.',
							color: '#36a64f',
							pretext: 'Optional text that appears above the attachment block',
							author_name: 'Seth Pollack',
							author_link: 'http://sethpollack.net',
							author_icon: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
							title: 'Slack API Documentation',
							title_link: 'https://api.slack.com/',
							text: 'Optional text that appears within the attachment',
							fields: [{
								title: 'We have a new info log',
								value: ':scream_cat: foobar',
								short: true
							}]
						}]
					}),
					url: 'mywebhookurl'
			};

			log.info('foobar');
			sinon.assert.calledWith(request.post, expectedResponse);
		});
	});

	describe('error handler', function() {
		it('should use error handler', function(done) {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl',
					customFormatter: function(record, levelName) {
						return record.foo();
					}
				}, function(error) {
					expect(error).to.instanceof(TypeError);
					done();
				}),
				level: 'info'
			});
			log.info('foobar');
		});

		it('should use request error handler', function(done) {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanSlack({
					webhook_url: 'mywebhookurl'
				}, function(error) {
					expect(error).to.eql('FAKE ERROR');
					done();
				}),
				level: 'info'
			});
			log.info('foobar');
			errorHandler.firstCall.args[1]('FAKE ERROR');
		});
	});

	describe('logger arguments', function() {
        it('should accept a single string argument', function () {
            var log = Bunyan.createLogger({
                name: 'myapp',
                stream: new BunyanSlack({
                    webhook_url: 'mywebhookurl'
                }),
                level: 'info'
            });

            var expectedResponse = {
                body: JSON.stringify({
                    text: '[INFO] foobar'
                }),
                url: 'mywebhookurl'
            };

            log.info('foobar');
            sinon.assert.calledWith(request.post, expectedResponse);
        });

        it('should accept a single object argument', function () {
            var log = Bunyan.createLogger({
                name: 'myapp',
                stream: new BunyanSlack({
                    webhook_url: 'mywebhookurl',
                    customFormatter: function (record, levelName) {
                        return {text: util.format('[%s] %s', levelName.toUpperCase(), record.error)};
                    }
                }),
                level: 'info'
            });

            var expectedResponse = {
                body: JSON.stringify({
                    text: '[INFO] foobar'
                }),
                url: 'mywebhookurl'
            };

            log.info({error: 'foobar'});
            sinon.assert.calledWith(request.post, expectedResponse);
        });

        it('should accept an object and string as arguments', function () {
            var log = Bunyan.createLogger({
                name: 'myapp',
                stream: new BunyanSlack({
                    webhook_url: 'mywebhookurl',
                    customFormatter: function (record, levelName) {
                        return {text: util.format('[%s] %s & %s', levelName.toUpperCase(), record.error, record.msg)};
                    }
                }),
                level: 'info'
            });

            var expectedResponse = {
                body: JSON.stringify({
                    text: '[INFO] this is the error & this is the message'
                }),
                url: 'mywebhookurl'
            };
            log.info({error: 'this is the error'}, 'this is the message');
            sinon.assert.calledWith(request.post, expectedResponse);
        });

        it('should return a empty message queue after running the interval', function () {
            var bs = new BunyanSlack({
                webhook_url: 'mywebhookurl',
                rate_limit_interval: 1000
            });
    		bs.messageQueue.push('message');
            bs.intervalRunner();
            expect(bs.messageQueue.pop()).to.equal(undefined);
        });

        it('should return a message on the queue', function () {
            var bs = new BunyanSlack({
                webhook_url: 'mywebhookurl',
                rate_limit_interval: 1000
            });
            bs.write({ level: 60, msg: 'Hello Sir' });
            expect(bs.messageQueue.pop().text).to.equal('[FATAL] Hello Sir');
        });

	});
});



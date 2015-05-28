var util = require('util'),
request  = require('request'),
extend   = require('extend.js');

function BunyanSlack(options, error) {
	options = options || {};
	if (!options.webhook_url && !options.webhookUrl) {
		throw new Error('webhook url cannot be null');
	} else {

		this.customFormatter = options.customFormatter;
		this.webhook_url     = options.webhook_url || options.webhookUrl;
		this.error           = error               || function() {};

		if (options.icon_url || options.iconUrl) {
			this.icon_url = options.icon_url || options.iconUrl;
		}

		if (options.icon_emoji || options.iconEmoji) {
			this.icon_emoji = options.icon_emoji || options.iconEmoji;
		}

		if (options.channel) {
			this.channel = options.channel;
		}

		if (options.username) {
			this.username = options.username;
		}

	}
}

var nameFromLevel = {
	10: 'trace',
	20: 'debug',
	30: 'info',
	40: 'warn',
	50: 'error',
	60: 'fatal'
};

BunyanSlack.prototype.write = function write(record) {
	var self = this,
	levelName,
	message;

	if (typeof record === 'string') {
		record = JSON.parse(record);
	}

	levelName = nameFromLevel[record.level];

	try {
		message = self.customFormatter ? self.customFormatter(record, levelName) : {
			text: util.format('[%s] %s', levelName.toUpperCase(), record.msg)
		};
	} catch(err) {
		return self.error(err);
	}
	var base = {
		channel: self.channel,
		username: self.username,
		icon_url: self.icon_url,
		icon_emoji: self.icon_emoji
	};

	message = extend(base, message);

	request.post({
		url: self.webhook_url,
		body: JSON.stringify(message)
	})
	.on('error', function(err) {
		return self.error(err);
	});
};

module.exports = BunyanSlack;

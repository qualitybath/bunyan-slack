var util = require('util'),
request  = require('request'),
extend   = require('extend.js');

function BunyanSlack(options) {
	options = options || {};
	if (!options.webhook_url && !options.webhookUrl) {
		throw new Error("webhook url cannot be null");
	} else {
		
		this.webhook_url = options.webhook_url || options.webhookUrl;
		this.customFormatter = options.customFormatter;
		this.icon_url = options.icon_url || options.iconUrl;
		this.icon_emoji = options.icon_emoji || options.iconEmoji;
		this.channel    = options.channel    || "#general";
		this.username   = options.username   || "Bunyan Slack";

		if (!this.icon_url && !this.icon_emoji) {
			this.icon_emoji = ':scream_cat:';
		}
		
	}
}

var nameFromLevel = {
	10 : 'trace',
	20 : 'debug',
	30 : 'info',
	40 : 'warn',
	50 : 'error',
	60 : 'fatal'
};

BunyanSlack.prototype.write = function write(json) {
	var record = JSON.parse(json);
	var levelName = nameFromLevel[record.level];

	var message = this.customFormatter ? this.customFormatter(record, levelName) : {
		text: util.format("[%s] %s", levelName.toUpperCase(), record.msg)
	};

	var base = {
		channel: this.channel,
		username: this.username,
		icon_url: this.icon_url,
		icon_emoji: this.icon_emoji
	};

	message = extend(base, message);

	request({
		method: "POST",
		uri: this.webhook_url,
		body: JSON.stringify(message)
	});
};

module.exports = BunyanSlack;

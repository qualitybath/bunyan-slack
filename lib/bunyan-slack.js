var util = require('util'),
	request = require('request'),
	extend = require('extend.js');

function BunyanSlack(options) {
	options = options || {};
	if (!options.webhook_url) {
		throw new Error("webhook url cannot be null");
	} else {
		this.webhook_url = options.webhook_url;
		this.channel = options.channel;
		this.icon_url = options.icon_url || "https://cldup.com/9M--n6m2F6-3000x3000.jpeg";
		this.username = options.username || "Bunyan Slack";
		this.customFormatter = options.customFormatter;
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

BunyanSlack.prototype.write = function write(msg) {
	var json = JSON.parse(msg);
	var message = this.customFormatter ? this.customFormatter(json) : {
		text: util.format("[%s] %s", nameFromLevel[json.level].toUpperCase(), json.msg)
	};

	var base = {
		channel: this.channel,
		username: this.username,
		icon_url: this.icon_url
	};

	message = extend(base, message);

	request({
		method: "POST",
		uri: this.webhook_url,
		body: JSON.stringify(message)
	});
};

module.exports = BunyanSlack;
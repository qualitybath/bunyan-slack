# bunyan-slack
[![bunyan-slack](http://img.shields.io/npm/v/bunyan-slack.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-slack)
[![bunyan-slack](http://img.shields.io/npm/dm/bunyan-slack.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-slack)
[![bunyan-slack](http://img.shields.io/npm/l/bunyan-slack.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-slack)


**Bunyan stream for Slack chat integration**

First install bunyan...

```
npm install bunyan
```

Then install bunyan-slack

```
npm install bunyan-slack
```

##Basic Setup

```javascript
var bunyan  = require("bunyan"),
	BunyanSlack = require('bunyan-slack'),
	log;

log = bunyan.createLogger({
	name: "myApp",
	stream: new BunyanSlack({
		webhook_url: "your_webhook_url",
		channel: "your_channel",
		username: "your_username",
	}),
	level: "error"
});

log.error("hello bunyan slack");
```
##Custom Formatters

By default the logs are formatted like so: `[LOG_LEVEL] message`, unless you specify a `customFormatter` function.

```javascript
	log = bunyan.createLogger({
	name: "myApp",
	stream: new BunyanSlack({
		webhook_url: "your_webhook_url",
		channel: "your_channel",
		username: "your_username",
		customFormatter: function(record){
			return {text: "[" + record.level + "] " + record.msg }
		}
	}),
	level: "error"
});
```
##Custom Formatter Options
> Formatting options below are taken from the [slack docs](https://api.slack.com/incoming-webhooks)

For a simple message, your JSON payload must contain a text property.
This is the text that will be posted to the channel.
```javascript
{
    "text": "This is a line of text.\nAnd this is another one."
}
```

This will be displayed in the channel as:

![enter image description here](https://api.slack.com/img/api/incoming_simple.png)

###Adding Links
To create a link in your text, enclose the URL in <> angle brackets. For example: `payload={"text": "<https://slack.com>"}` will post a clickable link to [https://slack.com](https://slack.com).

To display hyperlinked text instead of the actual URL, use the pipe character, as shown in this example:
```javascript
{
    "text": "<https://alert-system.com/alerts/1234|Click here> for details!"
}
```
This will be displayed in the channel as:

![enter image description here](https://api.slack.com/img/api/incoming_link.png)

###Customized Name and Icon
You can override an incoming webhook's configured name with the `username` parameter in your JSON payload.

You can also override the bot icon either with `icon_url` or `icon_emoji`.

```javascript
{
    "username": "new-bot-name",

    "icon_url": "https://slack.com/img/icons/app-57.png",
    "icon_emoji": ":ghost:"
}
```
An overridden username and icon could look like this:

![enter image description here](https://api.slack.com/img/api/incoming_name_icon.png)

###Channel Override

Incoming webhooks have a default channel. You can override it with the `channel` parameter in your JSON payload.

A public channel can be specified with `"channel": "#other-channel"`, and a Direct Message with `"channel": "@username"`.

```javascript
{
    "channel": "#other-channel",    // A public channel override
    "channel": "@username",         // A Direct Message override
}
```

###Defaults
bunyan-slack sets the following defaults:

*  `channel` => `"#general"`
* `username` => `"Bunyan Slack"`
* `icon_emoji` => `":scream_cat:"`


###Advanced Message Formatting
You can use [Slack's standard message markup](https://api.slack.com/docs/formatting) to add simple formatting to your messages. You can also use [message attachments](https://api.slack.com/docs/attachments) to display richly-formatted message blocks.

![enter image description here](https://api.slack.com/img/api/attachment_fields.png)


###Putting it all together
```javascript
var bunyan  = require("bunyan"),
	BunyanSlack = require('bunyan-slack'),
	log;

log = bunyan.createLogger({
	name: 'myapp',
	stream: new BunyanSlack({
		webhook_url: 'your_webhook_url',
		icon_url: "your_icon_url",
		channel: 'your_channel',
		username: "your_username",
		icon_emoji: ":scream_cat:",
		customFormatter: function(record) {
			return {
				attachments: [{
					fallback: "Required plain-text summary of the attachment.",
					color: '#36a64f',
					pretext: "Optional text that appears above the attachment block",
					author_name: "Seth Pollack",
					author_link: "http://sethpollack.net",
					author_icon: "http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200",
					title: "Slack API Documentation",
					title_link: "https://api.slack.com/",
					text: "Optional text that appears within the attachment",
					fields: [{
						title: "We have a new incoming log",
						value: ":scream_cat: " + record.msg,
						short: true
					}]
				}]
			};
		}
	}),
	level: 'error'
});
```

## Authors
* [Seth Pollack](https://github.com/sethpollack)

***
This library was adapted from  [winston-bishop-slack](https://github.com/lapwinglabs/winston-bishop-slack)

The MIT License  
Copyright (c) 2014 [Seth Pollack](https://github.com/sethpollack)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



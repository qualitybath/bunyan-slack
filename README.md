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

## Basic Setup

```javascript
const bunyan = require('bunyan');
const BunyanSlack = require('bunyan-slack');

const log = bunyan.createLogger({
  name: 'myApp',
  streams: [
    {
      type: 'raw',
      stream: new BunyanSlack({
        webhookUrl: 'your_webhook_url',
        channel: '#your_channel',
        username: 'your_username',
      }),
    },
  ],
  level: 'error',
});

log.error('hello bunyan slack');
```

You can also pass an optional error handler.

> Specify a Slack channel by name with `"channel": "#other-channel"`, or send a Slackbot message to a specific user with `"channel": "@username"`.

```javascript
const stream = new BunyanSlack({
  webhookUrl: 'your_webhook_url',
  channel: '#your_channel',
  username: 'your_username',
  onError: function(error) {
    console.log(error);
  },
});
```

## Custom Formatters

By default the logs are formatted like so: `[LOG_LEVEL] message`, unless you specify a `customFormatter` function.

```javascript
const log = bunyan.createLogger({
  name: 'myApp',
  stream: new BunyanSlack({
    webhookUrl: 'your_webhook_url',
    channel: '#your_channel',
    username: 'your_username',
    customFormatter: function(record, levelName) {
      return { text: '[' + levelName + '] ' + record.msg };
    },
  }),
  level: 'error',
});
```

## Custom Formatter Options

> Check the [slack docs](https://api.slack.com/incoming-webhooks) for custom formatter options.

### Putting it all together

```javascript
const bunyan = require('bunyan');
const BunyanSlack = require('bunyan-slack');

const log = bunyan.createLogger({
  name: 'myapp',
  stream: new BunyanSlack({
    webhookUrl: 'your_webhook_url',
    iconUrl: 'your_icon_url',
    channel: '#your_channel',
    username: 'your_username',
    iconEmoji: ':scream_cat:',
    customFormatter: function(record, levelName) {
      return {
        attachments: [
          {
            fallback: 'Required plain-text summary of the attachment.',
            color: '#36a64f',
            pretext: 'Optional text that appears above the attachment block',
            author_name: 'Seth Pollack',
            author_link: 'http://sethpollack.net',
            author_icon: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
            title: 'Slack API Documentation',
            title_link: 'https://api.slack.com/',
            text: 'Optional text that appears within the attachment',
            fields: [
              {
                title: 'We have a new ' + levelName + ' log',
                value: ':scream_cat: ' + record.msg,
                short: true,
              },
            ],
          },
        ],
      };
    },
  }),
  level: 'error',
});
```

---

This library was adapted from [winston-bishop-slack](https://github.com/lapwinglabs/winston-bishop-slack)

The MIT License  
Copyright (c) 2015 [QualityBath.com](https://www.qualitybath.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

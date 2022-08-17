import Bunyan from 'bunyan';
import got from 'got';
import BunyanSlack from '../src';

describe('Bunyan Slack', () => {
  describe('constructor', function() {
    it('should require a webhook', function() {
      expect(function() {
        new BunyanSlack({} as any);
      }).toThrow(new Error('Webhook url required'));
    });

    it('should set options', function() {
      const spy = jest.spyOn(got, 'post').mockReturnValueOnce({ success: true } as any);

      const options = {
        webhookUrl: 'mywebhookurl',
        channel: '#bunyan-slack',
        username: '@sethpollack',
        iconEmoji: ':smile:',
        iconUrl: 'http://www.gravatar.com/avatar/3f5ce68fb8b38a5e08e7abe9ac0a34f1?s=200',
      };

      const log = Bunyan.createLogger({
        name: 'myapp',
        streams: [{ type: 'raw', stream: new BunyanSlack(options) }],
        level: 'info',
      });

      const logText = 'foobar';
      log.info(logText);
      expect(spy).toHaveBeenCalledWith(options.webhookUrl, {
        json: {
          channel: options.channel,
          username: options.username,
          icon_url: options.iconUrl,
          icon_emoji: options.iconEmoji,
          text: `[INFO] ${logText}`,
        },
      });
    });

    it('should use the custom formatter', function() {
      const spy = jest.spyOn(got, 'post').mockReturnValueOnce({ success: true } as any);

      const options = {
        webhookUrl: 'mywebhookurl',
        customFormatter: (record: any, levelName: string) => {
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
                    title: `We have a new ${levelName} log`,
                    value: `:scream_cat: ${record.msg}`,
                    short: true,
                  },
                ],
              },
            ],
          };
        },
      };

      const log = Bunyan.createLogger({
        name: 'myapp',
        streams: [{ type: 'raw', stream: new BunyanSlack(options) }],
        level: 'info',
      });

      const logText = 'foobar';
      log.info(logText);
      expect(spy).toHaveBeenCalledWith(options.webhookUrl, {
        json: {
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
                  title: 'We have a new info log',
                  value: ':scream_cat: foobar',
                  short: true,
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe('error handler', function() {
    it('should use the custom error handler', function() {
      const onError = jest.fn();

      const options = {
        webhookUrl: 'mywebhookurl',
        customFormatter: (record: any) => {
          return record.foo();
        },
        onError,
      };

      const log = Bunyan.createLogger({
        name: 'myapp',
        streams: [{ type: 'raw', stream: new BunyanSlack(options) }],
        level: 'info',
      });
      log.info('foobar');
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});

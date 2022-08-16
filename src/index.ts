import util from 'util';
import got from 'got';
import { MessageAttachment } from '@slack/types';

enum ERecordLevel {
  trace = 10,
  debug = 20,
  info = 30,
  warn = 40,
  error = 50,
  fatal = 60,
}

const noop = () => {};
function defaultFormatter<T extends { msg: string; level: ERecordLevel }>(
  record: T,
  levelName: keyof typeof ERecordLevel
) {
  return {
    text: util.format('[%s] %s', levelName.toUpperCase(), record.msg),
  };
}

export default class BunyanSlack<T extends { msg: string; level: ERecordLevel }> {
  webhookUrl: string;
  channel: string;
  username: string;
  iconUrl?: string;
  iconEmoji?: string;
  customFormatter: (
    record: T,
    levelName: keyof typeof ERecordLevel
  ) => { text: string } | { attachments: MessageAttachment[] };
  onError: (err: unknown) => void;

  constructor(
    options: Omit<BunyanSlack<T>, 'write' | 'customFormatter' | 'onError'> & {
      customFormatter?: BunyanSlack<T>['customFormatter'];
      onError?: BunyanSlack<T>['onError'];
    }
  ) {
    this.webhookUrl = options.webhookUrl;
    this.channel = options.channel;
    this.username = options.username;
    this.iconUrl = options.iconUrl;
    this.iconEmoji = options.iconEmoji;
    this.customFormatter = options.customFormatter || defaultFormatter;
    this.onError = options.onError || noop;
  }

  async write(record: T | string) {
    try {
      const parsedRecord = typeof record === 'string' ? (JSON.parse(record) as T) : record;
      const levelName = ERecordLevel[parsedRecord.level] as keyof typeof ERecordLevel;

      const body = {
        channel: this.channel,
        username: this.username,
        icon_url: this.iconUrl,
        icon_emoji: this.iconEmoji,
        message: this.customFormatter(parsedRecord, levelName),
      };

      await got.post(this.webhookUrl, { json: body });
    } catch (err) {
      this.onError(err);
    }
  }
}

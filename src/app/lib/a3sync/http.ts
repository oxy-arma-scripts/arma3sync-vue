import { Readable } from 'node:stream';
import { createGunzip } from 'node:zlib';

import { ofetch, type $Fetch } from 'ofetch';
import deserializer from 'java-deserialization';

import { version as VERSION } from '~/../package.json';

import {
  type BaseClient,
  AutoConfig,
  type AutoConfigType,
  Changelogs,
  type ChangelogsType,
  Events,
  type EventType,
  ServerInfo,
  type ServerInfoType,
  Sync,
  type SyncType,
} from './types';

export type Client = BaseClient<'http', $Fetch>;

function getClient(baseURL: URL, timeout?: number): Promise<Client> {
  const url = new URL(baseURL);
  url.username = '';
  url.password = '';

  const authorization = Buffer.from([baseURL.username, baseURL.password].join(':')).toString('base64');

  const client = ofetch.create({
    baseURL: url.toString(),
    headers: {
      'User-Agent': `Arma3Sync/${VERSION}`,
      Authorization: `Basic ${authorization}`,
    },
    timeout,
  });

  return Promise.resolve({
    type: 'http',
    client,
    baseURL,
  });
}

async function fetchA3SFile({ client }: Client, path: string): Promise<unknown> {
  const response = await client(path, {
    method: 'GET',
    responseType: 'stream',
  });

  const stream = Readable.fromWeb(response).pipe(createGunzip());

  const buffer = Buffer.concat(await Array.fromAsync(stream));
  return deserializer.parse(buffer);
}

async function getAutoConfig(client: Client): Promise<AutoConfigType> {
  const data = await fetchA3SFile(client, '/.a3s/autoconfig');
  return AutoConfig.parseAsync(data);
}

async function getChangelogs(client: Client): Promise<ChangelogsType> {
  const data = await fetchA3SFile(client, '/.a3s/changelogs');
  return Changelogs.parseAsync(data);
}

async function getEvents(client: Client): Promise<EventType> {
  const data = await fetchA3SFile(client, '/.a3s/events');
  return Events.parseAsync(data);
}

async function getServerInfo(client: Client): Promise<ServerInfoType> {
  const data = await fetchA3SFile(client, '/.a3s/serverinfo');
  return ServerInfo.parseAsync(data);
}

async function getSync(client: Client): Promise<SyncType> {
  const data = await fetchA3SFile(client, '/.a3s/sync');
  return Sync.parseAsync(data);
}

export {
  getClient,
  getAutoConfig,
  getChangelogs,
  getEvents,
  getServerInfo,
  getSync,
};

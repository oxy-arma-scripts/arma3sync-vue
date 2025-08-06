import { Readable } from 'node:stream';
import { createGunzip } from 'node:zlib';

import { ofetch, type $Fetch } from 'ofetch';
import deserializer from 'java-deserialization';

import { version as VERSION } from '~/../package.json';

import {
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

function getClient(url: URL, timeout?: number): Promise<$Fetch> {
  const baseURL = new URL(url);
  baseURL.username = '';
  baseURL.password = '';

  const authorization = Buffer.from([url.username, url.password].join(':')).toString('base64');

  const client = ofetch.create({
    baseURL: baseURL.toString(),
    headers: {
      'User-Agent': `Arma3Sync/${VERSION}`,
      Authorization: `Basic ${authorization}`,
    },
    timeout,
  });

  return Promise.resolve(client);
}

async function fetchA3SFile(client: $Fetch, path: string): Promise<unknown> {
  const response = await client(path, {
    method: 'GET',
    responseType: 'stream',
  });

  const stream = Readable.fromWeb(response).pipe(createGunzip());

  const buffer = Buffer.concat(await Array.fromAsync(stream));
  return deserializer.parse(buffer);
}

async function getAutoConfig(client: $Fetch): Promise<AutoConfigType> {
  const data = await fetchA3SFile(client, '/.a3s/autoconfig');
  return AutoConfig.parseAsync(data);
}

async function getChangelogs(client: $Fetch): Promise<ChangelogsType> {
  const data = await fetchA3SFile(client, '/.a3s/changelogs');
  return Changelogs.parseAsync(data);
}

async function getEvents(client: $Fetch): Promise<EventType> {
  const data = await fetchA3SFile(client, '/.a3s/events');
  return Events.parseAsync(data);
}

async function getServerInfo(client: $Fetch): Promise<ServerInfoType> {
  const data = await fetchA3SFile(client, '/.a3s/serverinfo');
  return ServerInfo.parseAsync(data);
}

async function getSync(client: $Fetch): Promise<SyncType> {
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

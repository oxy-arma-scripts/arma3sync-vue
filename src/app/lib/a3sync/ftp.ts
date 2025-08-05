import { PassThrough } from 'node:stream';
import { createGunzip } from 'node:zlib';
import { join } from 'node:path/posix';

import { Client as FTPClient } from 'basic-ftp';
import deserializer from 'java-deserialization';

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

async function getClient(url: URL, timeout?: number): Promise<FTPClient> {
  const client = new FTPClient(timeout);

  await client.access({
    host: url.hostname,
    port: Number.parseInt(url.port, 10) || 21,
    user: url.username || undefined,
    password: url.password || undefined,
  });

  return client;
}

async function fetchA3SFile(client: FTPClient, path: string): Promise<unknown> {
  const stream = new PassThrough().pipe(createGunzip());

  await client.downloadTo(stream, path);

  const buffer = Buffer.concat(await Array.fromAsync(stream));
  return deserializer.parse(buffer);
}

async function getAutoConfig(client: FTPClient, basePath?: string): Promise<AutoConfigType> {
  const data = await fetchA3SFile(client, join(basePath || '', '/.a3s/autoconfig'));
  return AutoConfig.parseAsync(data);
}

async function getChangelogs(client: FTPClient, basePath?: string): Promise<ChangelogsType> {
  const data = await fetchA3SFile(client, join(basePath || '', '/.a3s/changelogs'));
  return Changelogs.parseAsync(data);
}

async function getEvents(client: FTPClient, basePath?: string): Promise<EventType> {
  const data = await fetchA3SFile(client, join(basePath || '', '/.a3s/events'));
  return Events.parseAsync(data);
}

async function getServerInfo(client: FTPClient, basePath?: string): Promise<ServerInfoType> {
  const data = await fetchA3SFile(client, join(basePath || '', '/.a3s/serverinfo'));
  return ServerInfo.parseAsync(data);
}

async function getSync(client: FTPClient, basePath?: string): Promise<SyncType> {
  const data = await fetchA3SFile(client, join(basePath || '', '/.a3s/sync'));
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

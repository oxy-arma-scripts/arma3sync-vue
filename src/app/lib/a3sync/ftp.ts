import { PassThrough, type Readable } from 'node:stream';
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

async function streamToBuffer(readableStream: Readable) {
  return new Promise<Buffer<ArrayBuffer>>((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (data) => {
      chunks.push(data);
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

async function getClient(url: URL, timeout?: number) {
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

  const buffer = await streamToBuffer(stream);
  return deserializer.parse(buffer);
}

async function getAutoConfig(client: FTPClient, path: string): Promise<AutoConfigType> {
  const data = await fetchA3SFile(client, path);
  return AutoConfig.parseAsync(data);
}

async function getChangelogs(client: FTPClient, path: string): Promise<ChangelogsType> {
  const data = await fetchA3SFile(client, join(path, 'changelogs'));
  return Changelogs.parseAsync(data);
}

async function getEvents(client: FTPClient, path: string): Promise<EventType> {
  const data = await fetchA3SFile(client, join(path, 'events'));
  return Events.parseAsync(data);
}

async function getServerInfo(client: FTPClient, path: string): Promise<ServerInfoType> {
  const data = await fetchA3SFile(client, join(path, 'serverinfo'));
  return ServerInfo.parseAsync(data);
}

async function getSync(client: FTPClient, path: string): Promise<SyncType> {
  const data = await fetchA3SFile(client, join(path, 'sync'));
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

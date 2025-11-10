import { PassThrough } from 'node:stream';
import { createGunzip } from 'node:zlib';
import { join } from 'node:path/posix';

import { Client as FTPClient } from 'basic-ftp';
import deserializer from 'java-deserialization';

import {
  type BaseClient,
  AutoConfig,
  type AutoConfigType,
  Changelogs,
  type ChangelogsType,
  Modsets,
  type ModsetsType,
  ServerInfo,
  type ServerInfoType,
  Sync,
  type SyncType,
} from './types';

export type Client = BaseClient<'ftp', FTPClient>;

async function getClient(baseURL: URL, timeout?: number): Promise<Client> {
  const client = new FTPClient(timeout);

  await client.access({
    host: baseURL.hostname,
    port: Number.parseInt(baseURL.port, 10) || 21,
    user: baseURL.username || undefined,
    password: baseURL.password || undefined,
  });

  return {
    type: 'ftp',
    client,
    baseURL,
  };
}

async function fetchA3SFile({ client, baseURL }: Client, path: string): Promise<unknown> {
  const stream = new PassThrough().pipe(createGunzip());

  await client.downloadTo(stream, join(baseURL.pathname || '', path));

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

async function getModsets(client: Client): Promise<ModsetsType> {
  const data = await fetchA3SFile(client, '/.a3s/modsModsets');
  return Modsets.parseAsync(data);
}

async function getServerInfo(client: Client): Promise<ServerInfoType> {
  const data = await fetchA3SFile(client, '/.a3s/serverinfo');
  return ServerInfo.parseAsync(data);
}

async function getSync(client: Client): Promise<SyncType> {
  const data = await fetchA3SFile(client, '/.a3s/sync');
  return Sync.parseAsync(data);
}

async function downloadFile({ client }: Client, source: string, destination: string) {
  await client.downloadTo(destination, source);
}

export {
  getClient,
  getAutoConfig,
  getChangelogs,
  getModsets,
  getServerInfo,
  getSync,
  downloadFile,
};

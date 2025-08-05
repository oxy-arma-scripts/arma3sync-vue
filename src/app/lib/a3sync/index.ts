import { Client as FTPClient } from 'basic-ftp';
import type { $Fetch } from 'ofetch';

import * as ftp from './ftp';
import * as http from './http';

import type {
  AutoConfigType,
  ChangelogsType,
  EventType,
  ServerInfoType,
  SyncType,
} from './types';

type A3SClient = $Fetch | FTPClient;

async function getClient(url: URL, timeout?: number): Promise<A3SClient> {
  const { protocol } = url;
  if (protocol.startsWith('http')) {
    return http.getClient(url, timeout);
  }
  if (protocol.startsWith('ftp')) {
    return ftp.getClient(url, timeout);
  }
  throw new Error(`Protocol "${protocol}" is not supported`);
}

async function getAutoConfig(client: A3SClient, basePath?: string): Promise<AutoConfigType> {
  if (client instanceof FTPClient) {
    return ftp.getAutoConfig(client, basePath);
  }
  return http.getAutoConfig(client);
}

async function getChangelogs(client: A3SClient, basePath?: string): Promise<ChangelogsType> {
  if (client instanceof FTPClient) {
    return ftp.getChangelogs(client, basePath);
  }
  return http.getChangelogs(client);
}

async function getEvents(client: A3SClient, basePath?: string): Promise<EventType> {
  if (client instanceof FTPClient) {
    return ftp.getEvents(client, basePath);
  }
  return http.getEvents(client);
}

async function getServerInfo(client: A3SClient, basePath?: string): Promise<ServerInfoType> {
  if (client instanceof FTPClient) {
    return ftp.getServerInfo(client, basePath);
  }
  return http.getServerInfo(client);
}

async function getSync(client: A3SClient, basePath?: string): Promise<SyncType> {
  if (client instanceof FTPClient) {
    return ftp.getSync(client, basePath);
  }
  return http.getSync(client);
}

export {
  type AutoConfigType,
  type ChangelogsType,
  type EventType,
  type ServerInfoType,
  type SyncType,

  getClient,
  getAutoConfig,
  getChangelogs,
  getEvents,
  getServerInfo,
  getSync,
};

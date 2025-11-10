import * as ftp from './ftp';
import * as http from './http';

import type {
  AutoConfigType,
  ChangelogsType,
  ModsetsType,
  ServerInfoType,
  SyncType,
} from './types';

type A3SClient = ftp.Client | http.Client;

async function getClient(baseURL: URL, timeout?: number): Promise<A3SClient> {
  const { protocol } = baseURL;
  if (protocol.startsWith('http')) {
    return http.getClient(baseURL, timeout);
  }
  if (protocol.startsWith('ftp')) {
    return ftp.getClient(baseURL, timeout);
  }
  throw new Error(`Protocol "${protocol}" is not supported`);
}

async function getAutoConfig(client: A3SClient): Promise<AutoConfigType> {
  switch (client.type) {
    case 'ftp':
      return ftp.getAutoConfig(client);
    case 'http':
      return http.getAutoConfig(client);

    default:
      throw new Error('Client type not supported');
  }
}

async function getChangelogs(client: A3SClient): Promise<ChangelogsType> {
  switch (client.type) {
    case 'ftp':
      return ftp.getChangelogs(client);
    case 'http':
      return http.getChangelogs(client);

    default:
      throw new Error('Client type not supported');
  }
}

async function getModsets(client: A3SClient): Promise<ModsetsType> {
  switch (client.type) {
    case 'ftp':
      return ftp.getModsets(client);
    case 'http':
      return http.getModsets(client);

    default:
      throw new Error('Client type not supported');
  }
}

async function getServerInfo(client: A3SClient): Promise<ServerInfoType> {
  switch (client.type) {
    case 'ftp':
      return ftp.getServerInfo(client);
    case 'http':
      return http.getServerInfo(client);

    default:
      throw new Error('Client type not supported');
  }
}

async function getSync(client: A3SClient): Promise<SyncType> {
  switch (client.type) {
    case 'ftp':
      return ftp.getSync(client);
    case 'http':
      return http.getSync(client);

    default:
      throw new Error('Client type not supported');
  }
}

async function downloadFile(client: A3SClient, source: string, destination: string) {
  switch (client.type) {
    case 'ftp':
      return ftp.downloadFile(client, source, destination);
    case 'http':
      return http.downloadFile(client, source, destination);

    default:
      throw new Error('Client type not supported');
  }
}

export {
  type A3SClient,
  type AutoConfigType,
  type ChangelogsType,
  type ModsetsType,
  type ServerInfoType,
  type SyncType,

  getClient,
  getAutoConfig,
  getChangelogs,
  getModsets,
  getServerInfo,
  getSync,
  downloadFile,
};

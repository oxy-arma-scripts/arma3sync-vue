import z from 'zod';

/**
 * Validation for an usable autoconfig from A3S, might not be 100% accurate
 */
export const AutoConfig = z.array(
  z.object({
    favoriteServers: z.object({
      size: z.number(),
      list: z.array(
        z.object({
          name: z.string(),
          repositoryName: z.string(),
          modsetName: z.string(),
          ipAddress: z.string(),
          port: z.int(),
          password: z.string(),
        }),
      ),
    }).catchall(z.unknown()).optional(),

    protocole: z.object({
      validateSSLCertificate: z.boolean(),
      connectionTimeOut: z.coerce.number(),
      encryptionMode: z.unknown(), // TODO: find out what this is
      protocolType: z.unknown(), // TODO: is a String object for some reason
      url: z.string(),
      login: z.string(),
      password: z.string(),
      port: z.coerce.number(),
    }).catchall(z.unknown()),

    repositoryName: z.string(),
  }).catchall(z.unknown()),
);

export type AutoConfigType = z.infer<typeof AutoConfig>;

export const Changelogs = z.unknown();

export type ChangelogsType = z.infer<typeof Changelogs>;

export const Events = z.unknown();

export type EventType = z.infer<typeof Events>;

export const ServerInfo = z.array(
  z.object({
    compressedPboFilesOnly: z.boolean(),
    noPartialFileTransfer: z.boolean(),
    numberOfConnections: z.int(),
    numberOfFiles: z.unknown(), // Long ???
    repositoryContentUpdated: z.boolean(),
    revision: z.int(),
    totalFilesSize: z.unknown(), // Long ???
  }).catchall(z.unknown()),
);

export type ServerInfoType = z.infer<typeof ServerInfo>;

export const Sync = z.unknown();

export type SyncType = z.infer<typeof Sync>;

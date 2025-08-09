import z from 'zod';

export type BaseClient<Type extends string, Client> = {
  type: Type;
  client: Client;
  baseURL: URL;
};

const JavaList = <Type extends z.ZodType>(items: Type) => z.object({
  size: z.number(),
  list: z.array(items).optional(),
}).catchall(z.unknown());

const JavaMap = <
  Key extends z.ZodType,
  Type extends z.ZodType,
>(keys: Key, items: Type) => z.object({
    size: z.number(),
    map: z.map(keys, items),
  }).catchall(z.unknown());

/**
 * Validation for an usable autoconfig from A3S, might not be 100% accurate
 */
export const AutoConfig = z.array(
  z.object({
    favoriteServers: JavaList(
      z.object({
        name: z.string(),
        repositoryName: z.string(),
        modsetName: z.string(),
        ipAddress: z.string(),
        port: z.int(),
        password: z.string(),
      }),
    ).optional(),

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

export const Changelogs = z.array(
  z.object({
    list: JavaList(
      z.object({
        contentUpdated: z.boolean(),
        revision: z.int(),
        addons: JavaList(z.string()),
        buildDate: z.object({ '@': z.unknown() }).catchall(z.unknown()), // Buffer
        deletedAddons: JavaList(z.string()),
        newAddons: JavaList(z.string()),
        updatedAddons: JavaList(z.string()),
      }).catchall(z.unknown()),
    ),
  }).catchall(z.unknown()),
);

export type ChangelogsType = z.infer<typeof Changelogs>;

export const Modsets = z.array(
  z.object({
    list: JavaList(
      z.object({
        addonNames: JavaMap(
          z.string(),
          z.object({
            value: z.boolean(),
          }).catchall(z.unknown()),
        ),
        description: z.string(),
        name: z.string(),
      }).catchall(z.unknown()),
    ),
  }).catchall(z.unknown()),
);

export type ModsetsType = z.infer<typeof Modsets>;

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

const SyncItem = z.object({
  name: z.string(),
  // @ts-expect-error - Should be fixed with new versions of TS
  get list() {
    return JavaList(SyncItem);
  },
}).catchall(z.unknown());

export const Sync = z.array(
  z.object({
    list: JavaList(
      z.object({
        name: z.string(),
        list: JavaList(SyncItem),
      }).catchall(z.unknown()),
    ),
  }).catchall(z.unknown()),
);

export type SyncType = z.infer<typeof Sync>;

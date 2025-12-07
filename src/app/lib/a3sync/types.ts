// oxlint-disable explicit-function-return-type, new-cap
import { z } from 'zod';

export type BaseClient<Type extends string, Client> = {
  type: Type;
  client: Client;
  baseURL: URL;
};

const JavaLong = z
  .object({
    low: z.number(),
    high: z.number(),
    unsigned: z.boolean(),
  })
  .pipe(z.preprocess((data) => data.low, z.number()));

const JavaList = <Type extends z.ZodType>(items: Type) => {
  const listType = z.array(items);
  return z
    .looseObject({
      size: z.number(),
      list: listType.optional(),
    })
    .pipe(z.preprocess((data) => data.list ?? [], listType));
};

const JavaMap = <
  Key extends z.ZodString | z.ZodNumber | z.ZodSymbol,
  Type extends z.ZodType,
>(
  keys: Key,
  items: Type
) => {
  const mapType = z.record(keys, items);
  return z.looseObject({
    obj: mapType.optional(),
  });
  // BUG: pipe 2 times for some reason
  // .pipe(z.preprocess((data) => data.obj, mapType));
};

/**
 * Validation for an usable autoconfig from A3S, might not be 100% accurate
 */
export const AutoConfig = z.array(
  z.looseObject({
    favoriteServers: JavaList(
      z.object({
        name: z.string(),
        repositoryName: z.string(),
        modsetName: z.string(),
        ipAddress: z.string(),
        port: z.int(),
        password: z.string(),
      })
    ).optional(),

    protocole: z.looseObject({
      validateSSLCertificate: z.boolean(),
      connectionTimeOut: z.coerce.number(),
      encryptionMode: z.unknown(),
      protocolType: z.unknown(),
      url: z.string(),
      login: z.string(),
      password: z.string(),
      port: z.coerce.number(),
    }),

    repositoryName: z.string(),
  })
);

export type AutoConfigType = z.infer<typeof AutoConfig>;

export const Changelogs = z.array(
  z.looseObject({
    list: JavaList(
      z.looseObject({
        contentUpdated: z.boolean(),
        revision: z.int(),
        addons: JavaList(z.string()),
        buildDate: z.looseObject({}), // Buffer
        deletedAddons: JavaList(z.string()),
        newAddons: JavaList(z.string()),
        updatedAddons: JavaList(z.string()),
      })
    ),
  })
);

export type ChangelogsType = z.infer<typeof Changelogs>;

export const Events = z.array(
  z.looseObject({
    list: JavaList(
      z.looseObject({
        addonNames: JavaMap(
          z.string(),
          z
            .object({
              value: z.boolean(),
            })
            .catchall(z.unknown())
        ),
        description: z.string(),
        name: z.string(),
      })
    ),
  })
);

export type EventsType = z.infer<typeof Events>;

export const ServerInfo = z.array(
  z.looseObject({
    compressedPboFilesOnly: z.boolean(),
    noPartialFileTransfer: z.boolean(),
    numberOfConnections: z.int(),
    numberOfFiles: JavaLong,
    repositoryContentUpdated: z.boolean(),
    revision: z.int(),
    totalFilesSize: JavaLong,
  })
);

export type ServerInfoType = z.infer<typeof ServerInfo>;

const SyncFileItem = z.looseObject({
  size: JavaLong,
  name: z.string(),
  sha1: z.string(),
});

const SyncFileDirectory = z.object({
  name: z.string(),
  deleted: z.boolean(),
  hidden: z.boolean(),
  markAsAddon: z.boolean(),
  updated: z.boolean(),

  parent: z.unknown(), // Skip it

  list: z.looseObject({
    size: z.number(),
    get list() {
      return z.array(SyncFileItem.or(SyncFileDirectory)).optional();
    },
  }),
});

export const Sync = z.array(SyncFileItem.or(SyncFileDirectory));

export type SyncType = z.infer<typeof Sync>;

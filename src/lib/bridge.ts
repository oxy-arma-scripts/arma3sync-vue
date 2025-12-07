import { ipcRenderer } from 'electron';
import type { LogFunctions } from 'electron-log';

import { renderLogger } from '~/lib/logger';

const invokeLogger = renderLogger.scope('renderer.methods');

/**
 * Prepare a method to be used with IPC
 *
 * @param name - Name of the method
 *
 * @returns The method
 */
export const registerIPCMethod =
  <Result = void, Params extends unknown[] = []>(name: string) =>
  (...args: Params): Promise<Result> => {
    invokeLogger.debug('Invoking method', { name, args });

    return ipcRenderer.invoke(`method:${name}`, ...args);
  };

type BridgeCallback<Type> = (value: Type) => void;

/**
 * Create a getter using IPC
 *
 * @param key - The key of bridge
 * @param logger - A logger
 *
 * @returns The getter
 */
const createGetter =
  <Type>(key: string, logger: LogFunctions) =>
  (): Promise<Type> => {
    logger.debug('Requesting data');
    return ipcRenderer.invoke(`bridge:${key}`);
  };

/**
 * Create a setter using IPC
 *
 * @param key - The key of bridge
 * @param logger - A logger
 *
 * @returns The setter
 */
const createSetter =
  <Type>(key: string, logger: LogFunctions) =>
  (value: Type): void => {
    logger.debug('Update sent', { value });
    ipcRenderer.invoke(`bridge:${key}`, value);
  };

/**
 * Create a watcher using IPC
 *
 * @param key - The key of bridge
 * @param logger - A logger
 *
 * @returns The watcher
 */
const createWatcher =
  <Type>(key: string, logger: LogFunctions) =>
  (listener: BridgeCallback<Type>): void => {
    ipcRenderer.on(`bridge:${key}`, (ev, data) => {
      logger.debug('Data received', { value: data });
      listener(data);
    });
  };

/**
 * Register a bridge using IPC
 *
 * @param key - The key of bridge
 *
 * @returns The bridge
 */
export function registerBridge<Type = unknown>(
  key: string
): {
  get: () => Promise<Type>;
  set: (val: Type) => void;
  watch: (listener: BridgeCallback<Type>) => void;
} {
  const logger = renderLogger.scope(`renderer.bridge.${key}`);

  return {
    get: createGetter<Type>(key, logger),
    set: createSetter<Type>(key, logger),
    watch: createWatcher<Type>(key, logger),
  };
}

/**
 * Register a readonly bridge using IPC
 *
 * @param key - The key of bridge
 *
 * @returns The readonly bridge
 */
export function registerReadonlyBridge<Type = unknown>(
  key: string
): {
  get: () => Promise<Type>;
  watch: (listener: BridgeCallback<Type>) => void;
} {
  const logger = renderLogger.scope(`renderer.bridge.${key}`);

  return {
    get: createGetter<Type>(key, logger),
    watch: createWatcher<Type>(key, logger),
  };
}

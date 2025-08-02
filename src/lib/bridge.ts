import { ipcRenderer } from 'electron';
import { LogFunctions } from 'electron-log';

import renderLogger from '~/lib/logger';

const invokeLogger = renderLogger.scope('renderer.methods');

export const registerIPCMethod = <R = void, P extends unknown[] = []>(
  name: string,
) => (...args: P): Promise<R> => {
    invokeLogger.debug('Invoking method', { name });

    return ipcRenderer.invoke(`method:${name}`, ...args) as Promise<R>;
  };

type BridgeCallback<T> = (value: T) => void;

const createGetter = <T>(
  key: string,
  logger: LogFunctions,
) => () => {
    logger.debug('Requesting data');
    return ipcRenderer.invoke(`bridge:${key}`) as Promise<T>;
  };

const createSetter = <T>(
  key: string,
  logger: LogFunctions,
) => (value: T) => {
    logger.debug('Update sent', { value });
    ipcRenderer.invoke(`bridge:${key}`, value) as Promise<T>;
  };

const createWatcher = <T>(
  key: string,
  logger: LogFunctions,
) => (cb: BridgeCallback<T>) => ipcRenderer.on(
    `bridge:${key}`,
    (ev, data) => {
      logger.debug('Data received', { value: data });
      cb(data);
    },
  );

export function registerBridge<T = unknown>(key: string) {
  const logger = renderLogger.scope(`renderer.bridge.${key}`);

  return {
    get: createGetter<T>(key, logger),
    set: createSetter<T>(key, logger),
    watch: createWatcher<T>(key, logger),
  };
}
export function registerReadonlyBridge<T = unknown>(key: string) {
  const logger = renderLogger.scope(`renderer.bridge.${key}`);

  return {
    get: createGetter<T>(key, logger),
    watch: createWatcher<T>(key, logger),
  };
}

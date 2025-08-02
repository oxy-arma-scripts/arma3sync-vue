import { LogFunctions } from 'electron-log';

import { listenToRender, sendToRender } from '~/app/lib/window';

type IPCMethod<R, P extends unknown[]> = (...args: P) => R | Promise<R>;

export function prepareMethod<R, P extends unknown[]>(fnc: IPCMethod<R, P>, name?: string) {
  listenToRender(`method:${name || fnc.name}`, async (_, ...args) => {
    const result = await fnc(...args as P);
    return result;
  });
}

const createGetter = <T>(key: string, getValue: () => T) => () => getValue();

const createSetter = <T>(
  key: string,
  logger: LogFunctions,
  setValue: (value: T) => void,
) => (value: T) => {
    setValue(value);
    logger.debug('Data sent', { value });
    sendToRender(`bridge:${key}`, value);
  };

export function prepareBridge<T = unknown>(
  key: string,
  logger: LogFunctions,
  getValue: () => T,
  setValue: (value: T) => void,
  opts?: { readonly?: boolean },
) {
  const getter = createGetter<T>(key, getValue);
  const setter = createSetter<T>(key, logger, setValue);

  listenToRender(`bridge:${key}`, (_, value?: T) => {
    if (!opts?.readonly && value != null) {
      logger.debug('Data received', { value });
      setter(value);
    }
    return getter();
  });

  return {
    get: getter,
    set: setter,
  };
}

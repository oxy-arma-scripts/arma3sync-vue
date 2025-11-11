import type { LogFunctions } from 'electron-log';

import { listenToRender, sendToRender } from '~/app/lib/window';

type IPCMethod<Result, Params extends unknown[]> = (
  ...args: Params
) => Result | Promise<Result>;

/**
 * Prepare a method to be used with IPC
 *
 * @param fnc - The function
 * @param name - Name of the method (defaults to function name)
 */
export function prepareMethod<Result, Params extends unknown[]>(
  fnc: IPCMethod<Result, Params>,
  name?: string
): void {
  listenToRender(`method:${name || fnc.name}`, async (_, ...args) => {
    const result = await fnc(...(args as Params));
    return result;
  });
}

/**
 * Create a getter using IPC
 *
 * @param key - The key of bridge
 * @param logger - A logger
 * @param getValue - How to get the value
 *
 * @returns The getter
 */
const createGetter =
  <Type>(key: string, logger: LogFunctions, getValue: () => Type) =>
  (): Type =>
    getValue();

/**
 * Create a setter using IPC
 *
 * @param key - The key of bridge
 * @param logger - A logger
 * @param setValue - How to set the value
 *
 * @returns The getter
 */
const createSetter =
  <Type>(key: string, logger: LogFunctions, setValue: (value: Type) => void) =>
  (value: Type): void => {
    setValue(value);
    logger.debug('Data sent', { value });
    sendToRender(`bridge:${key}`, value);
  };

/**
 * Register a bridge using IPC
 *
 * @param key - The key of bridge
 * @param logger - A logger
 * @param getValue - How to get the value
 * @param setValue - How to set the value
 * @param opts - Options of the bridge
 *
 * @returns The bridge
 */
// oxlint-disable-next-line max-params
export function prepareBridge<Type = unknown>(
  key: string,
  logger: LogFunctions,
  getValue: () => Type,
  setValue: (value: Type) => void,
  opts?: { readonly?: boolean }
): { get: () => Type; set: (val: Type) => void } {
  const getter = createGetter<Type>(key, logger, getValue);
  const setter = createSetter<Type>(key, logger, setValue);

  listenToRender(`bridge:${key}`, (_, value?: Type) => {
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

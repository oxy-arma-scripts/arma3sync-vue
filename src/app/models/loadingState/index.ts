import type { LoadingState } from './types';

import { getLoadingState, setLoadingState } from './state';

/**
 * Set step status
 *
 * @param key - The step to update
 * @param val - The new value of the step
 */
export function setStep(key: keyof LoadingState, val: boolean): void {
  setLoadingState({
    ...getLoadingState(),
    [key]: val,
  });
}

export { getLoadingState } from './state';

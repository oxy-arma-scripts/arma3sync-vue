import { listenToRender, sendToRender } from '../lib/window';
import mainLogger from '../lib/logger';

const logger = mainLogger.scope('counter');

let count = 0;
export function getCounter() {
  return count;
}

export function setCounter(value: number) {
  count = value;
  logger.debug('value updated', { value });
  sendToRender('counter', count);
}

listenToRender('counter', (_, value?: number) => {
  if (value != null) {
    logger.debug('value received', { value });
    setCounter(value);
  }
  return count;
});

// setInterval(() => {
//   setCounter(count + 1);
// }, 5000);

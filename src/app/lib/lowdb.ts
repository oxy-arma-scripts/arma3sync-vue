import { join } from 'node:path';

import { app } from 'electron';
import { Low, Memory } from 'lowdb';
import { JSONFile } from 'lowdb/node';

/**
 * Create a DB around a JSON file
 *
 * @param filename - The name of the file, will be put in userData of the app
 * @param defaultState - The default state of the DB
 *
 * @returns The DB
 */
export function createFileDB<Type extends Record<string, unknown>>(
  filename: string,
  defaultState: Type
): Low<Type> & { path: string } {
  const path = join(app.getPath('userData'), filename);

  const db = new Low(new JSONFile(path), defaultState);
  Object.assign(db, { path });

  return db as Low<Type> & { path: string };
}

/**
 * Create a DB in memory
 *
 * @param defaultState - The default state of the DB
 *
 * @returns The DB
 */
export function createMemoryDB<Type extends Record<string, unknown>>(
  defaultState: Type
): Low<Type> {
  return new Low(new Memory(), defaultState);
}

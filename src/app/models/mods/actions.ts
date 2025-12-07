import { basename } from 'node:path';

import { t } from '~/app/lib/i18n';
import { showOpenDialog } from '~/app/lib/window';

import { addModSources } from './state';

/**
 * Open a picker to add mod sources
 */
export async function openModSourcePicker(): Promise<
  { path: string; name: string }[]
> {
  const result = await showOpenDialog({
    title: t('mod-sources.folderPicker.title'),
    properties: ['openDirectory', 'dontAddToRecent'],
  });

  const sources = result.filePaths
    .filter((path) => !!path)
    .map((path) => ({
      path,
      name: basename(path),
    }));

  await addModSources(sources);

  return sources;
}

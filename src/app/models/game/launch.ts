import { xdgData } from 'xdg-basedir';

import path from 'node:path';
import { existsSync } from 'node:fs';

import { APP_ID } from '~/app/lib/a3';
import { isMacOs } from '~/app/lib/platforms/macos';
import { isWindows } from '~/app/lib/platforms/windows';
import { isLinux } from '~/app/lib/platforms/linux';

// TODO: Allow to not use steam

function checkIsProton() {
  if (isWindows) {
    return false;
  }
  // TODO: Do a proper check
  // return executable === "arma3_x64.exe";
  return true;
}

function checkIsFlatpak() {
  if (!isLinux) {
    return false;
  }

  const searchPaths = ['/var/lib', xdgData];
  return searchPaths.some((p) => {
    const steamPathInFlatpak = path.join(p, 'flatpak/exports/bin/com.valvesoftware.Steam');
    return existsSync(steamPathInFlatpak);
  });
}

function getModParam(mods: string[]): string {
  if (isWindows) {
    return mods.join(';');
  }

  const isProton = checkIsProton();

  if (isProton) {
    return mods.map((m) => path.win32.resolve('Z:\\', m))
      .join(';');
  }
  // TODO: check if macos uses the same format
  return mods.join('\\;');
}

export default async function launchGame(
  params: string[],
  mods: string[],
) {
  // TODO: locate steam

  let steamCmd = 'steam.exe';
  if (!isWindows) {
    steamCmd = 'steam';

    const isFlatpak = checkIsFlatpak();
    if (isFlatpak) {
      steamCmd = 'flatpak run com.valvesoftware.Steam';
    }
  }

  let cmd = `${steamCmd} -applaunch ${APP_ID} ${params.join(' ')}`;
  if (mods.length > 0) {
    cmd += ` -mod="${getModParam(mods)}"`;
  }

  // TODO: execute
  console.log(cmd);
}

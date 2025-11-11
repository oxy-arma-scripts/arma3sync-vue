import { xdgData } from 'xdg-basedir';

import { join } from 'node:path';
import { resolve as resolveWin32 } from 'node:path/win32';
import { existsSync } from 'node:fs';
import { spawn, type ChildProcess } from 'node:child_process';

import { APP_ID } from '~/app/lib/a3';
// import { isMacOs } from '~/app/lib/platforms/macos';
import { isWindows } from '~/app/lib/platforms/windows';
import { isLinux } from '~/app/lib/platforms/linux';

// TODO: Allow to not use steam

/**
 * Check if should run game with Proton
 *
 * @returns Should run game with proton
 */
function checkIsProton(): boolean {
  if (isWindows) {
    return false;
  }
  // TODO: Do a proper check
  // return executable === "arma3_x64.exe";
  return true;
}

/**
 * Check if steam is in flatpak
 *
 * @returns Should run game with steam in flatpak
 */
function checkIsFlatpak(): boolean {
  if (!isLinux) {
    return false;
  }

  const searchPaths = ['/var/lib', xdgData];
  return searchPaths.some((path) => {
    const steamPathInFlatpak = join(
      path,
      'flatpak/exports/bin/com.valvesoftware.Steam'
    );
    return existsSync(steamPathInFlatpak);
  });
}

/**
 * Transform list of mods into a start param
 *
 * @param mods - List of mod paths
 *
 * @returns The start param
 */
function getModParam(mods: string[]): string {
  if (isWindows) {
    return mods.join(';');
  }

  const isProton = checkIsProton();

  if (isProton) {
    return mods.map((mod) => resolveWin32('Z:\\', mod)).join(';');
  }
  // TODO: check if macos uses the same format
  return mods.join('\\;');
}

/**
 * Launch game with given params and mods
 *
 * @param params - List of start params (except mods)
 * @param mods - List of mod paths to start with game
 *
 * @returns Necessary data to track process
 */
export function launchGame(
  params: string[],
  mods: string[]
): {
  cmd: string;
  args: string[];
  process: ChildProcess;
} {
  // TODO: locate steam, and what if no steam ?

  let steamCmd = 'steam.exe';
  if (!isWindows) {
    steamCmd = 'steam';

    const isFlatpak = checkIsFlatpak();
    if (isFlatpak) {
      steamCmd = 'flatpak run com.valvesoftware.Steam';
    }
  }

  const cmd = `${steamCmd}`;
  const args = ['-applaunch', `${APP_ID}`, ...params];
  if (mods.length > 0) {
    args.push(`-mod="${getModParam(mods)}"`);
  }

  const process = spawn(cmd, args, {
    detached: true,
    stdio: 'ignore',
  });
  process.unref();

  return {
    cmd,
    args,
    process,
  };
}

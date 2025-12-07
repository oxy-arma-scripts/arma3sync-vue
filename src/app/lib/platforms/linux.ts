import { isMacOs } from './macos';
import { isWindows } from './windows';

export const isLinux = !isMacOs && !isWindows;

export const isWayland =
  process.env.XDG_BACKEND === 'wayland' ||
  process.env.GDK_BACKEND === 'wayland' ||
  process.env.XDG_SESSION_TYPE === 'wayland' ||
  process.env.WAYLAND_DISPLAY != null;

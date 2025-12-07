export type ModMeta = {
  /** Name of your mod */
  name?: string;
  /** Affects Arma 3 Launcher, when the mod are loaded as local */
  author?: string;
  /** Logo displayed in the main menu */
  logo?: string;
  /** When the mouse is over, in the main menu */
  logoOver?: string;
  tooltip?: string;
  /** Tool tip displayed when the mouse is left over, in the main menu */
  tooltipOwned?: string;
  /** Picture displayed from the expansions menu. Optimal size is 2048x1024 */
  picture?: string;
  actionName?: string;
  /** Website URL, that can be accessed from the expansions menu */
  action?: string;
  /** Supports structured text */
  overview?: string;
  /** Hide the extension name */
  hideName?: boolean;
  /** Hide the extension menu */
  hidePicture?: boolean;
  /** Color used for DLC stripes and backgrounds (RGBA) */
  dlcColor?: [number, number, number, number];
  /** Display in creative lists, next to the entities added by the mod */
  logoSmall?: string;
};

const fieldRegex =
  /^.*?(?<key>[a-z]+).*=\s*(?<value>(?:\$?[a-z0-9_-]+)|(?:".*")|(?:\{.*\})|\d+);/i;

type ModMetaSingleValue = string | number;
type ModMetaValue = ModMetaSingleValue | (string | number)[];

function parseModMetaSingleValue(value: string): ModMetaSingleValue {
  if (value[0] === '"') {
    return value.slice(1, -1);
  }
  if (value[0] === '{') {
    return value;
  }
  if (/\d/.test(value[0])) {
    return Number.parseFloat(value);
  }
  return value;
}

function parseModMetaValue(value: string): ModMetaValue {
  if (value[0] === '{') {
    const values = value.slice(1, -1);
    return values.split(',').map((output) => {
      const val = output.trim();
      return parseModMetaSingleValue(val);
    });
  }
  return parseModMetaSingleValue(value);
}

export function parseModMeta(cppContents: string): ModMeta {
  const lines = cppContents.split('\n');

  const meta: Record<string, unknown> = {};

  for (const line of lines) {
    const safeLine = line.trim().replaceAll('\u0000', '');
    const fieldMatches = fieldRegex.exec(safeLine);

    if (!fieldMatches?.groups) {
      continue;
    }

    const key = fieldMatches.groups.key?.trim();
    if (!key) {
      continue;
    }

    let value: ModMetaValue | boolean = parseModMetaValue(
      fieldMatches.groups?.value?.trim() ?? ''
    );
    if (['hideName', 'hidePicture'].includes(key)) {
      value = value === 1;
    }

    meta[key] = value;
  }

  return meta as ModMeta;
}

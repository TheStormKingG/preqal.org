import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * @param {{ root: string; envValue?: string; workspaceDirName: string; downloadsDirName: string }} opts
 */
export function resolveSlideSourceDir(opts) {
  const { root, envValue, workspaceDirName, downloadsDirName } = opts;
  const trimmed = envValue?.trim();
  if (trimmed) return trimmed;
  const inRepo = path.join(root, workspaceDirName);
  if (fs.existsSync(inRepo)) return inRepo;
  return path.join(os.homedir(), 'Downloads', downloadsDirName);
}

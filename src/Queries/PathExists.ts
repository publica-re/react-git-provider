import pathUtils from "path";

import { GitInternal } from "../Types";

/**
 * Options to check if a file exists
 */
export type PathExistsOptions = {
  /**
   * Path to the file
   */
  path: string;
};

/**
 * Check if a file exists
 */
export function pathExists(
  internal: GitInternal
): (options: PathExistsOptions) => Promise<boolean> {
  return async function pathExistsHelper({
    path,
  }: PathExistsOptions): Promise<boolean> {
    try {
      const physicalPath = pathUtils.join(internal.basepath, path);
      await internal.fs.promises.stat(physicalPath);
      return true;
    } catch (e) {
      return false;
    }
  };
}

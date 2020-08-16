import pathUtils from "path";

import { GitInternal } from "../Types";

/**
 * Parameters to unstage a file
 */
export type FileUnstageParams = {
  /**
   * Path to the file
   */
  path: string;
};

/**
 * Unstage a file
 */
export function fileUnstage(
  internal: GitInternal
): (params: FileUnstageParams) => Promise<void> {
  return async function fileUnstageHelper({
    path,
  }: FileUnstageParams): Promise<void> {
    const relativePath = pathUtils.relative("/", path);
    await internal.git.remove({
      fs: internal.fs,
      dir: internal.basepath,
      filepath: relativePath,
    });
  };
}

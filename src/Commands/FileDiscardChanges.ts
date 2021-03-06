import pathUtils from "path";

import { GitInternal } from "../Types";

/**
 * Parameters to discard a file
 */
export type FileDiscardChangesParams = {
  /**
   * Path to the file
   */
  path: string;
};

/**
 * Discard changes to a file
 */
export function fileDiscardChanges(
  internal: GitInternal
): (params: FileDiscardChangesParams) => Promise<void> {
  return async function fileDiscardChangesHelper({
    path,
  }: FileDiscardChangesParams): Promise<void> {
    const relativePath = pathUtils.relative("/", path);
    try {
      await internal.git.remove({
        fs: internal.fs,
        dir: internal.basepath,
        filepath: relativePath,
      });
    } catch (e) {
      internal.loggers.error(e);
    }
    await internal.git.checkout({
      fs: internal.fs,
      dir: internal.basepath,
      filepaths: [relativePath],
      force: true,
    });
    try {
      await internal.git.add({
        fs: internal.fs,
        dir: internal.basepath,
        filepath: relativePath,
      });
    } catch (e) {
      internal.loggers.error(e);
    }
    return;
  };
}

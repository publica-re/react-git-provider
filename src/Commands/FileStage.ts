import pathUtils from "path";

import { GitInternal } from "../Types";

/**
 * Parameters to stage a file
 */
export type FileStageParams = {
  /**
   * Path to the file
   */
  path: string;
};

/**
 * Stage a file
 */
export function fileStage(
  internal: GitInternal
): (params: FileStageParams) => Promise<void> {
  return async function fileStageHelper({
    path,
  }: FileStageParams): Promise<void> {
    const relativePath = pathUtils.relative("/", path);
    return await internal.git.add({
      fs: internal.fs,
      dir: internal.basepath,
      filepath: relativePath,
    });
  };
}

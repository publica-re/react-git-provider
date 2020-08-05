import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileStageParams = {
  path: string;
};

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

import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileUnstageParams = {
  path: string;
};

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

import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileRemoveParams = {
  path: string;
};

export function fileRemove(
  internal: GitInternal
): (params: FileRemoveParams) => Promise<boolean> {
  return async function fileRemoveHelper({
    path,
  }: FileRemoveParams): Promise<boolean> {
    const physicalPath = pathUtils.join(internal.basepath, path);
    const relativePath = pathUtils.relative("/", path);
    await internal.git.remove({
      fs: internal.fs,
      dir: internal.basepath,
      filepath: relativePath,
    });
    return await internal.fs.promises.unlink(physicalPath);
  };
}

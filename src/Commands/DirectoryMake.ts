import pathUtils from "path";

import { GitInternal } from "../Types";
import { pathExists } from "../Queries";

export type DirectoryMakeParams = {
  path: string;
};

export function directoryMake(
  internal: GitInternal
): (params: DirectoryMakeParams) => Promise<boolean> {
  return async function directoryMakeHelper({
    path,
  }: DirectoryMakeParams): Promise<boolean> {
    const physicalPath = pathUtils.join(internal.basepath, path);
    if (await pathExists(internal)({ path })) {
      return false;
    }
    await internal.fs.promises.mkdir(physicalPath);
    return true;
  };
}

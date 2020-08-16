import pathUtils from "path";

import { GitInternal } from "../Types";

import { FileStatus, GitStatus } from "./_types";
import { gitStatusFromQuery } from "./_utils";

export type FileStatusOptions = {
  path: string;
  ignore?: string;
};

export function fileStatus(
  internal: GitInternal
): (options: FileStatusOptions) => Promise<FileStatus> {
  return async function readDirectoryHelper({
    path,
    ignore,
  }: FileStatusOptions): Promise<FileStatus> {
    const base = pathUtils.basename(path);
    const dir = pathUtils.dirname(path);
    const physicalPath = pathUtils.join(internal.basepath, path);
    const relativePath = pathUtils.relative("/", path);
    const stat = await internal.fs.promises.stat(physicalPath);
    const objectType =
      (stat.isFile() && "file") ||
      (stat.isDirectory() && "directory") ||
      "unknown";
    let status: GitStatus | undefined = undefined;
    try {
      status = gitStatusFromQuery(
        await internal.git.status({
          fs: internal.fs,
          dir: internal.basepath,
          filepath: relativePath,
        })
      );
    } catch (e) {
      internal.loggers.error(e);
    }
    return {
      type: objectType,
      basename: base,
      dirname: dir,
      ignored: (ignore || [".git"]).includes(path),
      status: status,
    };
  };
}

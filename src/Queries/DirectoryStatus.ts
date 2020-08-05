import { FileStatus } from "./_types";
import { parseStatusMatrix } from "./_utils";
import { GitInternal } from "../Types";

export type DirectoryStatusOptions = {
  ref?: string;
};

export function directoryStatus(
  internal: GitInternal
): (
  options: DirectoryStatusOptions
) => Promise<{ [path: string]: FileStatus }> {
  return async function directoryStatusHelper({
    ref,
  }: DirectoryStatusOptions): Promise<{
    [path: string]: FileStatus;
  }> {
    return (
      await internal.git.statusMatrix({
        fs: internal.fs,
        dir: internal.basepath,
        ref: ref,
      })
    )
      .map(parseStatusMatrix)
      .reduce((prev, cur) => ({ ...prev, ...cur }), {});
  };
}

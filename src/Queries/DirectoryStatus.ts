import { DirectoryStatus } from "./_types";
import { parseStatusMatrix } from "./_utils";
import { GitInternal } from "../Types";

/**
 * Options to get the directory's status
 */
export type DirectoryStatusOptions = {
  /**
   * Name of the branch
   */
  ref?: string;
};

/**
 * Get a directory's status
 */
export function directoryStatus(
  internal: GitInternal
): (options: DirectoryStatusOptions) => Promise<DirectoryStatus> {
  return async function directoryStatusHelper({
    ref,
  }: DirectoryStatusOptions): Promise<DirectoryStatus> {
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

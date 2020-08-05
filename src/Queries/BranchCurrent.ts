import { GitInternal } from "../Types";

export type BranchCurrentOptions = {};

export function branchCurrent(
  internal: GitInternal
): (options: BranchCurrentOptions) => Promise<string | void> {
  return async function branchCurrentHelper(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: BranchCurrentOptions
  ): Promise<string | void> {
    return await internal.git.currentBranch({
      fs: internal.fs,
      dir: internal.basepath,
      fullname: false,
    });
  };
}

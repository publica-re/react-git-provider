import { GitInternal } from "../Types";

/**
 * Options to retrieve current branch
 */
export type BranchCurrentOptions = {};

/**
 * Retrieve the current branch
 */
export function branchCurrent(
  internal: GitInternal
): (options: BranchCurrentOptions) => Promise<string> {
  return async function branchCurrentHelper(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: BranchCurrentOptions
  ): Promise<string> {
    const currentBranch = internal.git.currentBranch({
      fs: internal.fs,
      dir: internal.basepath,
      fullname: false,
    });
    if (typeof currentBranch !== "string") {
      throw Error("unable to compute the current branch");
    }
    return currentBranch;
  };
}

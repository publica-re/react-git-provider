import { GitInternal } from "../Types";

/**
 * Parameters to remote a branch
 */
export type BranchRemoveParams = {
  /**
   * Name of the branch to remove
   */
  ref: string;
};

/**
 * Remove a branch
 */
export function branchRemove(
  internal: GitInternal
): (params: BranchRemoveParams) => Promise<void> {
  return async function branchRemove({
    ref,
  }: BranchRemoveParams): Promise<void> {
    return await internal.git.deleteBranch({
      fs: internal.fs,
      dir: internal.basepath,
      ref: ref,
    });
  };
}

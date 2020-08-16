import { GitInternal } from "../Types";

/**
 * Parameters to create a new branch
 */
export type BranchCreateParams = {
  /**
   * Name of the new branch.
   */
  ref: string;
};

/**
 * Create a branch
 */
export function branchCreate(
  internal: GitInternal
): (params: BranchCreateParams) => Promise<void> {
  return async function branchCreateHelper({
    ref,
  }: BranchCreateParams): Promise<void> {
    return await internal.git.branch({
      fs: internal.fs,
      dir: internal.basepath,
      ref: ref,
    });
  };
}

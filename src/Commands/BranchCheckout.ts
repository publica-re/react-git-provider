import { GitInternal } from "../Types";

/**
 * Parameters for a branch checkout
 */
export type BranchCheckoutParams = {
  /**
   * Reference of the branch to checkout or oid of the commit.
   */
  ref: string;
  /**
   * Update WORKDIR
   */
  checkout?: boolean;
  /**
   * Update HEAD
   */
  updateHead?: boolean;
};

/**
 * Checkout a branch
 */
export function branchCheckout(
  internal: GitInternal
): (params: BranchCheckoutParams) => Promise<void> {
  return async function branchCheckoutHelper({
    ref,
    checkout,
    updateHead,
  }: BranchCheckoutParams): Promise<void> {
    return await internal.git.checkout({
      fs: internal.fs,
      dir: internal.basepath,
      ref: ref,
      noCheckout: checkout !== undefined ? !checkout : undefined,
      noUpdateHead: updateHead !== undefined ? !updateHead : undefined,
      onProgress: internal.notifications.progress,
    });
  };
}

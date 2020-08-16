import { GitInternal } from "../Types";
import { branchCurrent } from "../Queries";

/**
 * Parameters to rebase a branch
 */
export type BranchRebaseParams = {
  /**
   * The branch or the commit oid to rebase
   */
  oid: string;
  /**
   * What branch to rebase (if `undefined`, will be the current branch)
   */
  ref?: string;
  /**
   * If false, do not checkout
   */
  noCheckout?: boolean;
};

/**
 * Rebase a branch
 */
export function branchRebase(
  internal: GitInternal
): (params: BranchRebaseParams) => Promise<void> {
  return async function branchRebaseHelper({
    oid,
    ref,
    noCheckout,
  }: BranchRebaseParams): Promise<void> {
    const branchName = ref || (await branchCurrent(internal)({})) || "master";
    const expanded = await internal.git.expandRef({
      fs: internal.fs,
      dir: internal.basepath,
      ref: branchName,
    });
    await internal.git.writeRef({
      fs: internal.fs,
      dir: internal.basepath,
      ref: expanded,
      value: oid,
      force: true,
    });
    if (noCheckout !== true) {
      await internal.git.checkout({
        fs: internal.fs,
        dir: internal.basepath,
        ref: branchName,
        noCheckout: false,
        noUpdateHead: false,
      });
    }
  };
}

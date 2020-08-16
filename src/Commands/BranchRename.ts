import { GitInternal } from "../Types";
import { branchCreate } from "./BranchCreate";
import { branchCheckout } from "./BranchCheckout";
import { branchRemove } from "./BranchRemove";

/**
 * Parameters to rename a branch
 */
export type BranchRenameParams = {
  /**
   * Old name
   */
  oldRef: string;
  /**
   * New name
   */
  newRef: string;
};

/**
 * Rename a branch
 */
export function branchRename(
  internal: GitInternal
): (params: BranchRenameParams) => Promise<void> {
  return async function branchRenameHelper({
    oldRef,
    newRef,
  }: BranchRenameParams): Promise<void> {
    const oldRefOid = await internal.git.resolveRef({
      fs: internal.fs,
      dir: internal.basepath,
      ref: "HEAD",
      depth: -1,
    });
    await branchCreate(internal)({ ref: newRef });
    await branchCheckout(internal)({
      ref: oldRefOid,
      updateHead: true,
      checkout: true,
    });
    await branchRemove(internal)({ ref: oldRef });
  };
}

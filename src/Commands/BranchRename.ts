import { GitInternal } from "../Types";
import { branchCreate } from "./BranchCreate";
import { branchSwitch } from "./BranchSwitch";
import { branchCheckout } from "./BranchCheckout";
import { branchRemove } from "./BranchRemove";

export type BranchRenameParams = {
  oldRef: string;
  newRef: string;
};

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
    await branchSwitch(internal)({ ref: newRef });
    await branchCheckout(internal)({
      oid: oldRefOid,
      updateHead: true,
      checkout: true,
    });
    await branchRemove(internal)({ ref: oldRef });
  };
}

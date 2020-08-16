import { GitInternal } from "../Types";
import { branchCurrent } from "../Queries";

export type BranchRebaseParams = {
  oid: string;
  ref?: string;
  noCheckout?: boolean;
};

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

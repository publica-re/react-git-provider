import { GitInternal } from "../Types";

export type BranchRemoveParams = {
  ref: string;
};

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

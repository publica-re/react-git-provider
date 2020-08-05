import { GitInternal } from "../Types";

export type BranchSwitchParams = {
  ref: string;
};

export function branchSwitch(
  internal: GitInternal
): (params: BranchSwitchParams) => Promise<void> {
  return async function branchSwitchHelper({
    ref,
  }: BranchSwitchParams): Promise<void> {
    return await internal.git.checkout({
      fs: internal.fs,
      dir: internal.basepath,
      ref: ref,
    });
  };
}

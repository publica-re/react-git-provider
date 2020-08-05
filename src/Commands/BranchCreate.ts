import { GitInternal } from "../Types";

export type BranchCreateParams = {
  ref: string;
};

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

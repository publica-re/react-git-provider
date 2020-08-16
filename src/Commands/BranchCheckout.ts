import { GitInternal } from "../Types";
import { checkout } from "isomorphic-git";

export type BranchCheckoutParams = {
  ref: string;
  checkout?: boolean;
  updateHead?: boolean;
};

/* TODO: think about that */
export function branchCheckout(
  internal: GitInternal
): (params: BranchCheckoutParams) => Promise<void> {
  return async function branchCheckoutHelper({
    ref,
    updateHead,
  }: BranchCheckoutParams): Promise<void> {
    return await internal.git.checkout({
      fs: internal.fs,
      dir: internal.basepath,
      ref: ref,
      noCheckout: checkout !== undefined ? !checkout : undefined,
      noUpdateHead: updateHead !== undefined ? !updateHead : undefined,
    });
  };
}

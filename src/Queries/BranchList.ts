import { GitInternal } from "../Types";
import { BranchList, Remote } from "./_types";
import { remoteList } from "./RemoteList";

/**
 * Options to list all branches (remote included)
 */
export type BranchListOptions = {};

/**
 * List all branches
 */
export function branchList(
  internal: GitInternal
): (options: BranchListOptions) => Promise<BranchList> {
  async function getBranches(remote?: string): Promise<string[]> {
    const branches = await internal.git.listBranches({
      fs: internal.fs,
      dir: internal.basepath,
      remote: remote !== "local" ? remote : undefined,
    });
    return branches.filter((branch) => !branch.endsWith("HEAD"));
  }
  return async function branchListHelper(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: BranchListOptions
  ): Promise<BranchList> {
    const remotes = await remoteList(internal)({});
    const branches = remotes.reduce(
      (cur: Record<string, string[]>, rem: Remote) => ({
        ...cur,
        [rem.remote]: [],
      }),
      {}
    );
    branches["local"] = [];
    for (const remote of Object.keys(branches)) {
      branches[remote] = await getBranches(remote);
    }
    return branches;
  };
}

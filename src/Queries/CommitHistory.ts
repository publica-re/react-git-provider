import { ReadCommitResult } from "isomorphic-git";

import { GitInternal } from "../Types";

/**
 * Options to list all commits
 */
export type CommitHistoryOptions = {
  /**
   * Number of commits to be returned (default = all)
   */
  depth?: number;
  /**
   * Branch
   */
  ref?: string;
  /**
   * Date since they have to be returned
   */
  since?: Date;
};

/**
 * List all commits
 */
export function commitHistory(
  internal: GitInternal
): (options: CommitHistoryOptions) => Promise<ReadCommitResult[]> {
  return async function commitHistoryHelper({
    depth,
    ref,
    since,
  }: CommitHistoryOptions): Promise<ReadCommitResult[]> {
    return await internal.git.log({
      fs: internal.fs,
      dir: internal.basepath,
      depth: depth,
      ref: ref,
      since: since,
    });
  };
}

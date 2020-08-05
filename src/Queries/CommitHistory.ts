import { ReadCommitResult } from "isomorphic-git";

import { GitInternal } from "../Types";

export type CommitHistoryOptions = {
  depth?: number;
  ref?: string;
  since?: Date;
};

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

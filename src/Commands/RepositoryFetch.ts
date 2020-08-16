import { GitInternal } from "../Types";
import { FetchResult } from "isomorphic-git";

/**
 * Parameter to fetch a repository
 */
export type RepositoryFetchParams = {
  /**
   * Remote name
   */
  remote?: string;
  /**
   * Branch to fetch (if `undefined`, all branches are fetched)
   */
  ref?: string;
};

/**
 * Default origin
 */
export const defaultPullRemote = "origin";

/**
 * Fetch a repository
 */
export function repositoryFetch(
  internal: GitInternal
): (params: RepositoryFetchParams) => Promise<FetchResult> {
  return async function repositoryFetchHelper({
    remote,
    ref,
  }: RepositoryFetchParams): Promise<FetchResult> {
    return await internal.git.fetch({
      fs: internal.fs,
      http: internal.http,
      corsProxy: internal.corsProxy,
      dir: internal.basepath,
      onAuth: internal.getAuth,
      onMessage: internal.loggers.message,
      remote: remote || defaultPullRemote,
      ref: ref,
      singleBranch: ref !== undefined,
    });
  };
}

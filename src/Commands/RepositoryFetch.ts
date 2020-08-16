import { GitInternal } from "../Types";
import { FetchResult } from "isomorphic-git";

export type RepositoryFetchParams = {
  remote?: string;
  ref?: string;
};

export const defaultPullRemote = "origin";

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

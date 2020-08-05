import { GitInternal } from "../Types";

export type RepositoryPullParams = {
  remote?: string;
  ref?: string;
};

export const defaultPullRemote = "origin";

export function repositoryPull(
  internal: GitInternal
): (params: RepositoryPullParams) => Promise<void> {
  return async function repositoryPullHelper({
    remote,
    ref,
  }: RepositoryPullParams): Promise<void> {
    return await internal.git.pull({
      fs: internal.fs,
      http: internal.http,
      corsProxy: internal.corsProxy,
      dir: internal.basepath,
      author: internal.author,
      onAuth: internal.getAuth,
      onMessage: internal.events.message,
      remote: remote || defaultPullRemote,
      ref: ref,
    });
  };
}

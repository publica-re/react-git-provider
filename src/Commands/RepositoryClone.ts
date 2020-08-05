import { GitInternal } from "../Types";

export type RepositoryCloneParams = {
  uri: string;
  remote?: string;
};

export function repositoryClone(
  internal: GitInternal
): (params: RepositoryCloneParams) => Promise<void> {
  return async function repositoryCloneHelper({
    uri,
    remote,
  }: RepositoryCloneParams): Promise<void> {
    return await internal.git.clone({
      fs: internal.fs,
      http: internal.http,
      corsProxy: internal.corsProxy,
      dir: internal.basepath,
      url: uri,
      remote: remote,
    });
  };
}

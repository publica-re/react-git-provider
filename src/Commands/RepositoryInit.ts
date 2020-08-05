import { GitInternal } from "../Types";

export type RepositoryInitParams = {
  defaultBranch?: string;
};

export function repositoryInit(
  internal: GitInternal
): (params: RepositoryInitParams) => Promise<void> {
  return async function repositoryInitHelper({
    defaultBranch,
  }: RepositoryInitParams): Promise<void> {
    return await internal.git.init({
      fs: internal.fs,
      dir: internal.basepath,
      defaultBranch: defaultBranch,
    });
  };
}

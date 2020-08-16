import { GitInternal } from "../Types";

/**
 * Parameters to initialize a repository
 */
export type RepositoryInitParams = {
  /**
   * Name of the default branch
   */
  defaultBranch?: string;
};

/**
 * Initialize a repository
 */
export function repositoryInit(
  internal: GitInternal
): (params: RepositoryInitParams) => Promise<void> {
  return async function repositoryInitHelper({
    defaultBranch,
  }: RepositoryInitParams): Promise<void> {
    await internal.git.init({
      fs: internal.fs,
      dir: internal.basepath,
      defaultBranch: defaultBranch,
    });
  };
}

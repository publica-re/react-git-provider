import { GitInternal } from "../Types";

/**
 * Parameters to clone a repository
 */
export type RepositoryCloneParams = {
  /**
   * URL of the repository
   */
  uri: string;
  /**
   * Should checkout and remove local changes
   */
  noCheckout?: boolean;
  /**
   * Remote name
   */
  remote?: string;
};

/**
 * Clone a repository
 */
export function repositoryClone(
  internal: GitInternal
): (params: RepositoryCloneParams) => Promise<void> {
  return async function repositoryCloneHelper({
    uri,
    noCheckout,
    remote,
  }: RepositoryCloneParams): Promise<void> {
    return await internal.git.clone({
      fs: internal.fs,
      http: internal.http,
      corsProxy: internal.corsProxy,
      dir: internal.basepath,
      url: uri,
      noCheckout: noCheckout,
      remote: remote,
      onAuth: internal.getAuth,
      onAuthSuccess: internal.handleAuthSuccess,
      onAuthFailure: internal.handleAuthFailure,
      onMessage: internal.notifications.message,
      onProgress: internal.notifications.progress,
    });
  };
}

import { PushResult } from "isomorphic-git";

import { GitInternal } from "../Types";

/**
 * Parameters to push to a repository
 */
export interface RepositoryPushParams {
  /**
   * Remote name
   */
  remote?: string;
  /**
   * Remote branch
   */
  remoteRef?: string;
  /**
   * Local name
   */
  ref?: string;
  /**
   * Force push
   */
  force?: boolean;
}

/**
 * Force by default
 */
export const defaultForce = false;
/**
 * Default remote
 */
export const defaultPushRemote = "origin";
/**
 * Default remote branch
 */
export const defaultRemoteRef = "master";

/**
 * Push a repository
 */
export function repositoryPush(
  internal: GitInternal
): (params: RepositoryPushParams) => Promise<PushResult> {
  return async function repositoryPushHelper({
    remote,
    remoteRef,
    ref,
    force,
  }: RepositoryPushParams): Promise<PushResult> {
    return await internal.git.push({
      fs: internal.fs,
      http: internal.http,
      corsProxy: internal.corsProxy,
      dir: internal.basepath,
      onAuth: internal.getAuth,
      remoteRef: remoteRef || defaultRemoteRef,
      remote: remote || defaultPushRemote,
      ref: ref,
      force: force || defaultForce,
      onMessage: internal.notifications.message,
      onProgress: internal.notifications.progress,
    });
  };
}

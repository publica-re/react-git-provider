import { PushResult } from "isomorphic-git";

import { GitInternal } from "../Types";

export interface RepositoryPushParams {
  remote?: string;
  remoteRef?: string;
  ref?: string;
  force?: boolean;
}

export const defaultForce = false;
export const defaultPushRemote = "origin";
export const defaultRemoteRef = "master";

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
      onMessage: internal.loggers.message,
      remoteRef: remoteRef || defaultRemoteRef,
      remote: remote || defaultPushRemote,
      ref: ref,
      force: force || defaultForce,
    });
  };
}

import { PushResult } from "isomorphic-git";

import { GitInternal } from "../Types";

export type RepositoryPushParams = {
  remote?: string;
  ref?: string;
  force?: boolean;
};

export const defaultForce = false;
export const defaultPushRemote = "origin";

export function repositoryPush(
  internal: GitInternal
): (params: RepositoryPushParams) => Promise<PushResult> {
  return async function repositoryPushHelper({
    remote,
    ref,
    force,
  }: RepositoryPushParams): Promise<PushResult> {
    return await internal.git.push({
      fs: internal.fs,
      http: internal.http,
      corsProxy: internal.corsProxy,
      dir: internal.basepath,
      onAuth: internal.getAuth,
      onMessage: internal.events.message,
      remote: remote || defaultPushRemote,
      ref: ref,
      force: force || defaultForce,
    });
  };
}

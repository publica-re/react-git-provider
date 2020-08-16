import { GitInternal } from "../Types";

import { Remote } from "./_types";

/**
 * Options to list remotes
 */
export type RemoteListOptions = {};

/**
 * List remotes
 */
export function remoteList(
  internal: GitInternal
): (options: RemoteListOptions) => Promise<Remote[]> {
  return async function remoteListHelper(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: RemoteListOptions
  ): Promise<Remote[]> {
    return await internal.git.listRemotes({
      fs: internal.fs,
      dir: internal.basepath,
    });
  };
}

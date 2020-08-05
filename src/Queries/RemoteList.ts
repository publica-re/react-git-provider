import { GitInternal } from "../Types";

import { Remote } from "./_types";

export type RemoteListOptions = {};

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

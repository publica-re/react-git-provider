import { GitInternal } from "../Types";

/**
 * Parameters to delete a remote
 */
export type RemoteDeleteParams = {
  /**
   * Name of the remote
   */
  name: string;
};

/**
 * Delete a remote
 */
export function remoteDelete(
  internal: GitInternal
): (params: RemoteDeleteParams) => Promise<void> {
  return async function remoteDelete({
    name,
  }: RemoteDeleteParams): Promise<void> {
    return await internal.git.deleteRemote({
      fs: internal.fs,
      dir: internal.basepath,
      remote: name,
    });
  };
}

import { GitInternal } from "../Types";

/**
 * Parameters to add a remote
 */
export type RemoteAddParams = {
  /**
   * Name of the remote
   */
  name: string;
  /**
   * URL to the remote
   */
  uri: string;
};

/**
 * Add a remote
 */
export function remoteAdd(
  internal: GitInternal
): (params: RemoteAddParams) => Promise<void> {
  return async function remoteAddHelper({
    name,
    uri,
  }: RemoteAddParams): Promise<void> {
    return await internal.git.addRemote({
      fs: internal.fs,
      dir: internal.basepath,
      remote: name,
      url: uri,
    });
  };
}

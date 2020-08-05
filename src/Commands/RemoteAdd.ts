import { GitInternal } from "../Types";

export type RemoteAddParams = {
  name: string;
  uri: string;
};

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

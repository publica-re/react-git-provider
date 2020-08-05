import { GitInternal } from "../Types";

export type RemoteDeleteParams = {
  name: string;
};

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

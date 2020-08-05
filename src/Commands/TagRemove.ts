import { GitInternal } from "../Types";

export type TagRemoveParams = {
  name: string;
};

export function tagRemove(
  internal: GitInternal
): (params: TagRemoveParams) => Promise<void> {
  return async function tagRemoveHelper({
    name,
  }: TagRemoveParams): Promise<void> {
    return await internal.git.deleteTag({
      fs: internal.fs,
      dir: internal.basepath,
      ref: name,
    });
  };
}

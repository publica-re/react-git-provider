import { GitInternal } from "../Types";

export type TagCreateParams = {
  name: string;
};

export function tagCreate(
  internal: GitInternal
): (params: TagCreateParams) => Promise<void> {
  return async function tagCreateHelper({
    name,
  }: TagCreateParams): Promise<void> {
    return await internal.git.tag({
      fs: internal.fs,
      dir: internal.basepath,
      ref: name,
    });
  };
}

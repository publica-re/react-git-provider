import { GitInternal } from "../Types";

/**
 * Parameters to remove a tag
 */
export type TagRemoveParams = {
  /**
   * Tag name
   */
  name: string;
};

/**
 * Remove a tag
 */
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

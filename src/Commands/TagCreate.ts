import { GitInternal } from "../Types";

/**
 * Parameters to create a tag
 */
export type TagCreateParams = {
  /**
   * Tag name
   */
  name: string;
};

/**
 * Create a tag
 */
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

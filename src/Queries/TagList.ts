import { GitInternal } from "../Types";

import { Tag } from "./_types";

/**
 * Options to list tags
 */
export type TagListOptions = {};

/**
 * List tags
 */
export function tagList(
  internal: GitInternal
): (options: TagListOptions) => Promise<string[]> {
  return async function tagListHelper(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: TagListOptions
  ): Promise<Tag[]> {
    return await internal.git.listTags({
      fs: internal.fs,
      dir: internal.basepath,
    });
  };
}

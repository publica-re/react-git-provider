import { GitInternal } from "../Types";

import { Tag } from "./_types";

export type TagListOptions = {};

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

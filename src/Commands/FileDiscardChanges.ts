import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileDiscardChangesParams = {
  path: string;
};

export function fileDiscardChanges(
  internal: GitInternal
): (params: FileDiscardChangesParams) => Promise<void> {
  return async function fileDiscardChangesHelper({
    path,
  }: FileDiscardChangesParams): Promise<void> {
    const relativePath = pathUtils.relative("/", path);
    await internal.git.remove({
      fs: internal.fs,
      dir: internal.basepath,
      filepath: relativePath,
    });
    await internal.git.checkout({
      fs: internal.fs,
      dir: internal.basepath,
      filepaths: [relativePath],
      force: true,
    });
    await internal.git.add({
      fs: internal.fs,
      dir: internal.basepath,
      filepath: relativePath,
    });
    return;
  };
}

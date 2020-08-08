import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileMoveParams = {
  from: string;
  to: string;
};

export function fileMove(
  internal: GitInternal
): (params: FileMoveParams) => Promise<void> {
  return async function fileMoveHelper({
    from,
    to,
  }: FileMoveParams): Promise<void> {
    const fromPhysicalPath = pathUtils.join(internal.basepath, from);
    const toPhysicalPath = pathUtils.join(internal.basepath, to);
    await internal.git.remove({
      fs: internal.fs,
      dir: internal.basepath,
      filepath: pathUtils.relative("/", from),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (internal.fs.promises as any).rename(
      fromPhysicalPath,
      toPhysicalPath
    );
    await internal.git.add({
      fs: internal.fs,
      dir: internal.basepath,
      filepath: pathUtils.relative("/", to),
    });
    return res;
  };
}

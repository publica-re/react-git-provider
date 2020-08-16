import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileReadAtOptions = {
  path: string;
  oid: string;
};

export function fileReadAt(
  internal: GitInternal
): (options: FileReadAtOptions) => Promise<string | undefined> {
  return async function fileReadAtHelper({
    path,
    oid,
  }: FileReadAtOptions): Promise<string | undefined> {
    const relativePath = pathUtils.relative("/", path);
    const { blob } = await internal.git.readBlob({
      fs: internal.fs,
      dir: internal.basepath,
      oid: oid,
      filepath: relativePath,
    });
    return Buffer.from(blob).toString("utf8");
  };
}

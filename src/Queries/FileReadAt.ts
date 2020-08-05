import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileReadAtOptions = {
  path: string;
  oid: string;
};

export function fileReadAt(
  internal: GitInternal
): (options: FileReadAtOptions) => Promise<string> {
  return async function fileReadAtHelper({
    path,
    oid,
  }: FileReadAtOptions): Promise<string> {
    const relativePath = pathUtils.relative("/", path);
    try {
      const { blob } = await internal.git.readBlob({
        fs: internal.fs,
        dir: internal.basepath,
        oid: oid,
        filepath: relativePath,
      });
      return Buffer.from(blob).toString("utf8");
    } catch (e) {
      internal.events.error(e);
      return "not found";
    }
  };
}

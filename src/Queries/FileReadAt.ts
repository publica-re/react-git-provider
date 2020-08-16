import pathUtils from "path";

import { GitInternal } from "../Types";

/**
 * Options to read a file at a given commit
 */
export type FileReadAtOptions = {
  path: string;
  oid: string;
  mode?: "binary" | "text";
};

export function fileReadAt(
  internal: GitInternal
): (options: FileReadAtOptions) => Promise<string | Uint8Array | undefined> {
  return async function fileReadAtHelper({
    path,
    oid,
    mode,
  }: FileReadAtOptions): Promise<string | Uint8Array | undefined> {
    const relativePath = pathUtils.relative("/", path);
    const { blob } = await internal.git.readBlob({
      fs: internal.fs,
      dir: internal.basepath,
      oid: oid,
      filepath: relativePath,
    });
    if (mode === "binary") {
      return Uint8Array.from(blob);
    } else {
      return Buffer.from(blob).toString("utf8");
    }
  };
}

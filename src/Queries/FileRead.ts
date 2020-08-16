import pathUtils from "path";

import { GitInternal } from "../Types";

/**
 * Options to read a file
 */
export type FileReadOptions = {
  /**
   * Path to the file
   */
  path: string;
  /**
   * Read mode (default = text)
   */
  mode?: "binary" | "text";
};

/**
 * Read a file
 */
export function fileRead(
  internal: GitInternal
): (options: FileReadOptions) => Promise<string | Uint8Array | undefined> {
  return async function fileReadHelper({
    path,
    mode,
  }: FileReadOptions): Promise<string | Uint8Array | undefined> {
    const physicalPath = pathUtils.join(internal.basepath, path);
    return await internal.fs.promises.readFile(physicalPath, {
      encoding: mode === "binary" ? undefined : "utf8",
    });
  };
}

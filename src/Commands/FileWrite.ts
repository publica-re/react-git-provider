import pathUtils from "path";

import { GitInternal } from "../Types";

/**
 * Parameters to write a file.
 *
 * Default mode: "text"
 */
export type FileWriteParams =
  | { path: string; content: string }
  | { path: string; content: string; mode: "text" }
  | { path: string; content: Uint8Array; mode: "binary" };

/**
 * Write a file
 */
export function fileWrite(
  internal: GitInternal
): (params: FileWriteParams) => Promise<boolean> {
  return async function fileWriteHelper(
    params: FileWriteParams
  ): Promise<boolean> {
    const physicalPath = pathUtils.join(internal.basepath, params.path);
    return await internal.fs.promises.writeFile(physicalPath, params.content, {
      encoding:
        (params as { mode: "text" | "binary" | undefined }).mode === "binary"
          ? undefined
          : "utf8",
    });
  };
}

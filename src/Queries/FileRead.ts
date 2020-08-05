import pathUtils from "path";

import { GitInternal } from "../Types";

export type FileReadOptions = {
  path: string;
  mode?: "binary" | "text";
};

export function fileRead(
  internal: GitInternal
): (options: FileReadOptions) => Promise<string | Uint8Array> {
  return async function fileReadHelper({
    path,
    mode,
  }: FileReadOptions): Promise<string | Uint8Array> {
    const physicalPath = pathUtils.join(internal.basepath, path);
    try {
      return await internal.fs.promises.readFile(physicalPath, {
        encoding: mode === "binary" ? undefined : "utf8",
      });
    } catch (e) {
      internal.events.error(e);
      return "not found";
    }
  };
}

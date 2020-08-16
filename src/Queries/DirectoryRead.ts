import pathUtils from "path";

import { DirectoryList, FileList } from "./_types";
import { GitInternal } from "../Types";

function makeFile(path: string): FileList {
  return {
    type: "file",
    path: path,
  };
}

function makeDir(
  path: string,
  children: (DirectoryList | FileList)[]
): DirectoryList {
  return {
    type: "directory",
    path: path,
    children: children,
  };
}

export type DirectoryReadOptions = {
  path: string;
  ignore?: string[];
};

export function directoryRead(
  internal: GitInternal
): (options: DirectoryReadOptions) => Promise<DirectoryList | FileList> {
  return async function directoryReadHelper({
    path,
    ignore,
  }: DirectoryReadOptions): Promise<DirectoryList | FileList> {
    const physicalPath = pathUtils.join(internal.basepath, path);
    const stat = await internal.fs.promises.stat(physicalPath);
    if (stat.isDirectory()) {
      const objects: string[] = await internal.fs.promises.readdir(
        physicalPath
      );
      const childrenObjects = objects.reduce(
        (prev: Promise<DirectoryList | FileList>[], obj: string) => {
          if (!(ignore || [".git"]).includes(obj)) {
            const objectPhysicalPath = pathUtils.join(path, obj);
            return [
              ...prev,
              directoryReadHelper({
                path: objectPhysicalPath,
                ignore: ignore,
              }),
            ];
          }
          return prev;
        },
        []
      );
      return makeDir(path, await Promise.all(childrenObjects));
    } else {
      return makeFile(path);
    }
  };
}

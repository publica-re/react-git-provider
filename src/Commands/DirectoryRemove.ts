import pathUtils from "path";

import { GitInternal } from "../Types";
import { directoryRead, DirectoryList, FileList } from "../Queries";

import { fileRemove } from "./";

export type DirectoryRemoveParams = {
  path: string;
};

export function directoryRemove(
  internal: GitInternal
): (params: DirectoryRemoveParams) => Promise<boolean> {
  return async function directoryRemoveHelper({
    path,
  }: DirectoryRemoveParams): Promise<boolean> {
    async function directoryRemoveHelperHelper(
      object: DirectoryList | FileList
    ): Promise<boolean> {
      const physicalPath = pathUtils.join(internal.basepath, object.path);
      if (object.type === "file") {
        return await fileRemove(internal)({ path: object.path });
      }
      await Promise.all(
        object.children.map(
          async (obj) => await directoryRemoveHelperHelper(obj)
        )
      );
      console.log(object.children);

      return await internal.fs.promises.rmdir(physicalPath);
    }
    const objects = await directoryRead(internal)({ path });
    console.log(objects);

    await directoryRemoveHelperHelper(objects);
    const newObjects = await directoryRead(internal)({ path });
    console.log(objects, newObjects);

    return true;
  };
}

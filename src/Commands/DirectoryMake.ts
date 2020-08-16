import pathUtils from "path";

import { GitInternal } from "../Types";
import { pathExists } from "../Queries";
import { fileWrite } from "./FileWrite";

/**
 * Pameters to create a new directory
 */
export type DirectoryMakeParams = {
  /**
   * Path of the directory
   */
  path: string;
};

/**
 * Create a new directory
 */
export function directoryMake(
  internal: GitInternal
): (params: DirectoryMakeParams) => Promise<boolean> {
  return async function directoryMakeHelper({
    path,
  }: DirectoryMakeParams): Promise<boolean> {
    const physicalPath = pathUtils.join(internal.basepath, path);
    if (await pathExists(internal)({ path })) {
      return false;
    }
    await internal.fs.promises.mkdir(physicalPath);
    await fileWrite(internal)({
      path: pathUtils.join(path, ".gitkeep"),
      content: "",
    });
    return true;
  };
}

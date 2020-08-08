import { GitInternal } from "../Types";
import { WalkerEntry } from "isomorphic-git";
import { nonPrintableChars } from "./_utils";
import { CompareStatus } from ".";

export type DirectoryCompareOptions = {
  left: string;
  right: string;
};

export function directoryCompare(
  internal: GitInternal
): (
  options: DirectoryCompareOptions
) => Promise<{ [path: string]: CompareStatus }> {
  return async function directoryStatusHelper({
    left,
    right,
  }: DirectoryCompareOptions): Promise<{
    [path: string]: CompareStatus;
  }> {
    const { fs, git, basepath } = internal;
    const out: { [path: string]: CompareStatus }[] = await git.walk({
      fs: fs,
      dir: basepath,
      trees: [git.TREE({ ref: left }), git.TREE({ ref: right })],
      map: async (file, entry: WalkerEntry[] | null) => {
        if (entry === null) return;
        const [leftStatus, rightStatus] = entry;
        const leftType = leftStatus && (await leftStatus.type());
        const rightType = rightStatus && (await rightStatus.type());
        if (["tree", "special", "commit"].includes(leftType)) return;
        if (["tree", "special", "commit"].includes(rightType)) return;
        const leftOid = leftStatus && (await leftStatus.oid());
        const rightOid = rightStatus && (await rightStatus.oid());
        const leftContent = leftStatus && (await leftStatus.content());
        const leftContentString =
          leftContent && Buffer.from(leftContent).toString("utf-8");
        const leftIsBinary =
          leftContent &&
          leftContent.findIndex((v) => nonPrintableChars.includes(v));
        const rightContent = rightStatus && (await rightStatus.content());
        const rightContentString =
          rightContent && Buffer.from(rightContent).toString("utf-8");
        const rightIsBinary =
          rightContent &&
          rightContent.findIndex((v) => nonPrintableChars.includes(v));
        if (leftOid && !rightOid) {
          return {
            [file]: {
              type: "left-only",
              leftContent: leftContentString,
              leftIsBinary: leftIsBinary,
            },
          };
        } else if (!leftOid && rightOid) {
          return {
            [file]: {
              type: "right-only",
              rightContent: rightContentString,
              rightIsBinary: rightIsBinary,
            },
          };
        } else if (!leftOid && !rightOid) {
          return {
            [file]: {
              type: "absent",
            },
          };
        } else if (leftOid == rightOid) {
          return {
            [file]: {
              type: "unchanged",
            },
          };
        } else {
          return {
            [file]: {
              type: "changed",
              leftContent: leftContentString,
              leftIsBinary: leftIsBinary,
              rightContent: rightContentString,
              rightIsBinary: rightIsBinary,
            },
          };
        }
      },
    });
    return Object.assign({}, ...out.filter((o) => o !== undefined));
  };
}

import { GitInternal } from "../Types";
import { MergeResult } from "isomorphic-git";
import { directoryCompare, MergeConflictSolution } from "../Queries";
import { createPatch } from "diff";

export type BranchMergeParams = {
  from: string;
  into: string;
};

export function branchMerge(
  internal: GitInternal
): (
  params: BranchMergeParams
) => Promise<MergeResult | MergeConflictSolution[]> {
  return async function branchMergeHelper({
    from,
    into,
  }: BranchMergeParams): Promise<MergeResult | MergeConflictSolution[]> {
    try {
      return await internal.git.merge({
        fs: internal.fs,
        dir: internal.basepath,
        ours: into,
        theirs: from,
        author: internal.author,
      });
    } catch (e) {
      if (e.name !== "MergeNotSupportedError") throw e;
      const compare = await directoryCompare(internal)({
        left: from,
        right: into,
      });
      const patches: MergeConflictSolution[] = [];
      for (const [path, entry] of Object.entries(compare)) {
        if (entry.type !== "unchanged" && entry.type !== "absent") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const entryAny = entry as any;
          if (entryAny.leftIsBinary || entryAny.rightIsBinary) {
            patches.push({
              file: path,
              type: "binary",
              left: entryAny.leftContent,
              right: entryAny.rightContent,
            });
          } else {
            patches.push({
              file: path,
              type: "patch",
              content: createPatch(
                path,
                entryAny.rightContent || "",
                entryAny.leftContent || ""
              ),
            });
          }
        }
      }
      return patches;
    }
  };
}

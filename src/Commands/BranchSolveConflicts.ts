import { GitInternal } from "../Types";
import { fileWrite } from "./FileWrite";
import { fileRead, MergeConflictSolution } from "../Queries";
import { applyPatch } from "diff";
import { branchCheckout } from "./BranchCheckout";
import { repositoryStageAndCommit } from "./RepositoryStageAndCommit";

export type BranchSolveConflictsParams = {
  mergeConflicts: MergeConflictSolution[];
  from: string;
  into: string;
};

export function branchSolveConflicts(
  internal: GitInternal
): (params: BranchSolveConflictsParams) => Promise<void> {
  return async function branchSolveConflictsHelper({
    mergeConflicts,
    from,
    into,
  }: BranchSolveConflictsParams): Promise<void> {
    await branchCheckout(internal)({
      ref: into,
      checkout: true,
      updateHead: true,
    });
    for (const conflict of mergeConflicts) {
      if (conflict.accept === true) {
        if (conflict.type === "binary") {
          await fileWrite(internal)({
            path: conflict.file,
            content: conflict.left,
            mode: "binary",
          });
        } else {
          const fileContent = await fileRead(internal)({
            path: conflict.file,
            mode: "text",
          });
          const applied = applyPatch(fileContent as string, conflict.content);
          fileWrite(internal)({
            path: conflict.file,
            content: applied,
          });
        }
      }
    }
    await repositoryStageAndCommit(internal)({
      message: `Merging ${from} into ${into}`,
    });
  };
}

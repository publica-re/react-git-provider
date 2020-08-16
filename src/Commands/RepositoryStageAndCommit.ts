import { GitInternal } from "../Types";
import { directoryStatus, GitStatusOption } from "../Queries";

import { fileStage, repositoryCommit } from "./";

/**
 * Parameters to stage and commit all files
 */
export type RepositoryStageAndCommitParams = {
  /**
   * Commit message
   */
  message: string;
};

/**
 * Stage and commit all files
 */
export function repositoryStageAndCommit(
  internal: GitInternal
): (params: RepositoryStageAndCommitParams) => Promise<string> {
  return async function repositoryStageAndCommitHelper({
    message,
  }: RepositoryStageAndCommitParams): Promise<string> {
    const matrix = await directoryStatus(internal)({});
    for (const [path, element] of Object.entries(matrix)) {
      if (element.status?.option !== GitStatusOption.UnModified) {
        await fileStage(internal)({ path: path });
      }
    }
    return repositoryCommit(internal)({ message: message });
  };
}

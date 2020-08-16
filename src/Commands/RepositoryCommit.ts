import { GitInternal } from "../Types";
import { directoryStatus } from "../Queries";

/**
 * Parameters to commit staged changes
 */
export type RepositoryCommitParams = {
  /**
   * Commit message
   */
  message: string;
};

/**
 * Commit staged changes.
 */
export function repositoryCommit(
  internal: GitInternal
): (params: RepositoryCommitParams) => Promise<string> {
  return async function repositoryCommitHelper({
    message,
  }: RepositoryCommitParams): Promise<string> {
    const elements = Object.values(await directoryStatus(internal)({}));
    if (elements.find(({ status }) => status?.staged)) {
      return await internal.git.commit({
        fs: internal.fs,
        dir: internal.basepath,
        author: internal.author,
        message: message,
      });
    }
    return "nothing";
  };
}

import pathUtils from "path";

import { GitStatus, GitStatusOption, FileStatus } from "./_types";

export function gitStatusFromQuery(
  status:
    | "modified"
    | "ignored"
    | "unmodified"
    | "*modified"
    | "*deleted"
    | "*added"
    | "absent"
    | "deleted"
    | "added"
    | "*unmodified"
    | "*absent"
    | "*undeleted"
    | "*undeletemodified"
): GitStatus {
  const staged = status.startsWith("*");
  const statusName = staged ? status.slice(1) : status;
  let option = GitStatusOption.Modified;
  switch (statusName) {
    case "modified":
      option = GitStatusOption.Modified;
      break;
    case "ignored":
      option = GitStatusOption.Ignored;
      break;
    case "unmodified":
      option = GitStatusOption.UnModified;
      break;
    case "deleted":
      option = GitStatusOption.Deleted;
      break;
    case "added":
      option = GitStatusOption.Added;
      break;
    case "absent":
      option = GitStatusOption.Absent;
      break;
    case "undeleted":
      option = GitStatusOption.UnDeleted;
      break;
    case "undeletedmodified":
      option = GitStatusOption.UnDeletedModified;
      break;
  }
  return {
    staged: staged,
    option: option,
  };
}

export function parseStatusMatrix([
  file,
  headStatus,
  workDirStatus,
  stageStatus,
]: [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]): { [path: string]: FileStatus } {
  function parseStatusMatrixHelper(): GitStatus {
    switch ([headStatus, workDirStatus, stageStatus].join("")) {
      case "000":
        return { staged: true, option: GitStatusOption.Absent };
      case "003":
        return { staged: false, option: GitStatusOption.Absent };
      case "020":
        return { staged: false, option: GitStatusOption.Added };
      case "022":
        return { staged: true, option: GitStatusOption.Added };
      case "023":
        return { staged: false, option: GitStatusOption.Added };
      case "100":
        return { staged: true, option: GitStatusOption.Deleted };
      case "101":
        return { staged: false, option: GitStatusOption.Deleted };
      case "103":
        return { staged: false, option: GitStatusOption.Deleted };
      case "110":
        return { staged: false, option: GitStatusOption.UnDeleted };
      case "111":
        return { staged: false, option: GitStatusOption.UnModified };
      case "113":
        return { staged: false, option: GitStatusOption.Modified };
      case "120":
        return { staged: false, option: GitStatusOption.UnDeletedModified };
      case "121":
        return { staged: false, option: GitStatusOption.Modified };
      case "122":
        return { staged: true, option: GitStatusOption.Modified };
      case "123":
        return { staged: false, option: GitStatusOption.Modified };
      default:
        throw Error(`unknown file status`);
    }
  }
  const basename = pathUtils.basename(file);
  const dirname = pathUtils.dirname(file);
  return {
    [pathUtils.resolve(file)]: {
      type: "file",
      basename: basename,
      dirname: dirname,
      ignored: false,
      status: parseStatusMatrixHelper(),
    },
  };
}

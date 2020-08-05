export type FileList = { type: "file"; path: string };
export type DirectoryList = {
  type: "directory";
  path: string;
  children: (FileList | DirectoryList)[];
};
export enum GitStatusOption {
  Ignored,
  UnModified,
  Modified,
  UnDeleted,
  Deleted,
  Added,
  Absent,
  UnDeletedModified,
}
export type GitStatus = {
  staged: boolean;
  option: GitStatusOption;
};
export type FileStatus = {
  type: "file" | "directory" | "unknown";
  basename: string;
  dirname: string;
  ignored?: boolean;
  status?: GitStatus;
};
export type Remote = {
  remote: string;
  url: string;
};
export type Tag = string;

export type Branch = string;

export interface BranchList {
  [remote: string]: Branch[];
}

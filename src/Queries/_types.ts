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

export type CompareStatus =
  | {
      type: "unchanged";
    }
  | {
      type: "absent";
    }
  | {
      type: "left-only";
      isBinary: boolean;
      leftContent: string | (() => Promise<Uint8Array>);
    }
  | {
      type: "right-only";
      rightContent: string;
      rightIsBinary: boolean;
    }
  | {
      type: "changed";
      leftContent: string;
      rightContent: string;
      leftIsBinary: boolean;
      rightIsBinary: boolean;
    };

export interface DirectoryCompare {
  [path: string]: CompareStatus;
}

export interface DirectoryStatus {
  [path: string]: FileStatus;
}

export type MergeConflictSolution =
  | {
      file: string;
      type: "binary";
      left: Uint8Array;
      right: Uint8Array;
      accept?: boolean;
    }
  | {
      file: string;
      type: "patch";
      content: string;
      accept?: boolean;
    };

export interface AuthorType {
  name: string;
  email: string;
}

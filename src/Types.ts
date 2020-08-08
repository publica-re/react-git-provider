/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DirectoryList,
  FileList,
  FileStatus,
  Tag,
  Remote,
  BranchCurrentOptions,
  BranchListOptions,
  CommitHistoryOptions,
  DirectoryCompareOptions,
  DirectoryReadOptions,
  DirectoryStatusOptions,
  FileReadAtOptions,
  FileReadOptions,
  PathExistsOptions,
  RemoteListOptions,
  TagListOptions,
  Branch,
  BranchList,
  CompareStatus,
} from "./Queries";
import git, {
  PromiseFsClient,
  HttpClient,
  GitAuth,
  ReadCommitResult,
  PushResult,
} from "isomorphic-git";
import {
  BranchCreateParams,
  BranchRemoveParams,
  BranchSwitchParams,
  BranchCheckoutParams,
  DirectoryMakeParams,
  DirectoryRemoveParams,
  FileDiscardChangesParams,
  FileRemoveParams,
  FileStageParams,
  FileUnstageParams,
  FileWriteParams,
  RemoteAddParams,
  RemoteDeleteParams,
  RepositoryCloneParams,
  RepositoryCommitParams,
  RepositoryInitParams,
  RepositoryPullParams,
  RepositoryPushParams,
  RepositoryStageAndCommitParams,
  TagCreateParams,
  TagRemoveParams,
  BranchRenameParams,
  FileMoveParams,
} from "./Commands";

const notImplemented = (): any => {
  throw Error("not implemented");
};

export type Path = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GitCommand<T extends Record<string, any>, U> = (
  params: T
) => Promise<U>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GitUnboundCommand<T extends Record<string, any>, U> = (
  internal: GitInternal
) => GitCommand<T, U>;

export type GitBaker<
  _T extends (keyof GitValues)[],
  U extends Record<string, any> = {}
> = (options: U, bake?: boolean) => Promise<any>;
export type GitRequiring<_T extends (keyof GitBakers)[], T> = T;
export type GitUpdating<
  _T extends (keyof GitBakers)[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  U
> = GitCommand<T, U>;

export interface GitInternal {
  fs: PromiseFsClient;
  git: typeof git;
  http: HttpClient;
  corsProxy: string;
  basepath: Path;
  events: {
    message: (message: string) => void;
    error: (error: string) => void;
  };
  author: {
    name: string;
    email: string;
  };
  setAuthor: (author: { name: string; email: string }) => void;
  url: string;
  getAuth: (url: string, auth: GitAuth) => Promise<GitAuth>;
}

export const defaultGitInternal: () => GitInternal = () => ({
  fs: {
    promises: {
      readFile: notImplemented,
      writeFile: notImplemented,
      unlink: notImplemented,
      readdir: notImplemented,
      mkdir: notImplemented,
      rmdir: notImplemented,
      stat: notImplemented,
      lstat: notImplemented,
      readlink: notImplemented,
      symlink: notImplemented,
      chmod: notImplemented,
    },
  },
  git: git,
  http: { request: notImplemented },
  corsProxy: "https://cors.isomorphic-git.org/",
  basepath: "/",
  events: {
    message: console.log,
    error: console.error,
  },
  author: {
    name: "react-git-provider",
    email: "dev@publica.re",
  },
  url: "/",
  setAuthor: notImplemented,
  async getAuth(): Promise<GitAuth> {
    return {
      username: prompt("User name") || undefined,
      password: prompt("Password") || undefined,
    };
  },
});

export interface GitCommands {
  branchCreate: GitUpdating<["branchList"], BranchCreateParams, void>;
  branchRemove: GitUpdating<
    [
      "branchList",
      "branchCurrent",
      "directoryRead",
      "directoryStatus",
      "fileRead",
      "pathExists",
      "commitHistory"
    ],
    BranchRemoveParams,
    void
  >;
  branchSwitch: GitUpdating<
    [
      "branchList",
      "branchCurrent",
      "directoryRead",
      "directoryStatus",
      "fileRead",
      "pathExists",
      "commitHistory"
    ],
    BranchSwitchParams,
    void
  >;
  branchRename: GitUpdating<
    [
      "branchList",
      "branchCurrent",
      "directoryRead",
      "directoryStatus",
      "fileRead",
      "pathExists",
      "commitHistory"
    ],
    BranchRenameParams,
    void
  >;
  branchCheckout: GitUpdating<
    ["directoryRead", "directoryStatus", "fileRead"],
    BranchCheckoutParams,
    void
  >;
  directoryMake: GitUpdating<
    ["directoryRead", "directoryStatus", "pathExists"],
    DirectoryMakeParams,
    boolean
  >;
  directoryRemove: GitUpdating<
    ["directoryRead", "directoryStatus", "fileRead", "pathExists"],
    DirectoryRemoveParams,
    boolean
  >;
  fileDiscardChanges: GitUpdating<
    ["directoryRead", "directoryStatus", "fileRead"],
    FileDiscardChangesParams,
    void
  >;
  fileRemove: GitUpdating<
    ["directoryRead", "directoryStatus", "fileRead", "pathExists"],
    FileRemoveParams,
    boolean
  >;
  fileStage: GitUpdating<["directoryStatus"], FileStageParams, void>;
  fileUnstage: GitUpdating<["directoryStatus"], FileUnstageParams, void>;
  fileWrite: GitUpdating<
    ["fileRead", "pathExists", "directoryStatus", "directoryRead"],
    FileWriteParams,
    boolean
  >;
  fileMove: GitUpdating<
    ["fileRead", "pathExists", "directoryStatus", "directoryRead"],
    FileMoveParams,
    void
  >;
  remoteAdd: GitUpdating<["remoteList", "branchList"], RemoteAddParams, void>;
  remoteDelete: GitUpdating<
    ["remoteList", "branchList"],
    RemoteDeleteParams,
    void
  >;
  repositoryClone: GitUpdating<
    [
      "branchList",
      "directoryRead",
      "directoryStatus",
      "fileRead",
      "pathExists",
      "commitHistory"
    ],
    RepositoryCloneParams,
    void
  >;
  repositoryCommit: GitUpdating<
    ["directoryStatus", "commitHistory"],
    RepositoryCommitParams,
    string
  >;
  repositoryInit: GitUpdating<
    [
      "branchList",
      "directoryRead",
      "directoryStatus",
      "fileRead",
      "pathExists",
      "commitHistory"
    ],
    RepositoryInitParams,
    void
  >;
  repositoryPull: GitUpdating<
    [
      "branchList",
      "directoryRead",
      "directoryStatus",
      "fileRead",
      "pathExists",
      "commitHistory"
    ],
    RepositoryPullParams,
    void
  >;
  repositoryPush: GitUpdating<
    [
      "branchList",
      "directoryRead",
      "directoryStatus",
      "fileRead",
      "commitHistory"
    ],
    RepositoryPushParams,
    PushResult
  >;
  repositoryStageAndCommit: GitUpdating<
    ["directoryStatus", "commitHistory"],
    RepositoryStageAndCommitParams,
    string
  >;
  tagCreate: GitUpdating<["tagList"], TagCreateParams, void>;
  tagRemove: GitUpdating<["tagList"], TagRemoveParams, void>;
}

export const defaultGitCommands: () => GitCommands = () => ({
  branchCreate: notImplemented,
  branchRemove: notImplemented,
  branchSwitch: notImplemented,
  branchRename: notImplemented,
  directoryMake: notImplemented,
  directoryRemove: notImplemented,
  branchCheckout: notImplemented,
  fileDiscardChanges: notImplemented,
  fileRemove: notImplemented,
  fileMove: notImplemented,
  fileStage: notImplemented,
  fileUnstage: notImplemented,
  fileWrite: notImplemented,
  remoteDelete: notImplemented,
  remoteAdd: notImplemented,
  repositoryClone: notImplemented,
  repositoryCommit: notImplemented,
  repositoryInit: notImplemented,
  repositoryPull: notImplemented,
  repositoryPush: notImplemented,
  repositoryStageAndCommit: notImplemented,
  tagCreate: notImplemented,
  tagRemove: notImplemented,
});

export interface GitBakers {
  branchCurrent: GitBaker<["branchCurrent"], BranchCurrentOptions>;
  branchList: GitBaker<["branchList"], BranchListOptions>;
  commitHistory: GitBaker<["commitHistory"], CommitHistoryOptions>;
  directoryRead: GitBaker<["fileTree"], DirectoryReadOptions>;
  directoryStatus: GitBaker<["fileStatusTree"], DirectoryStatusOptions>;
  directoryCompare: GitBaker<["directoryCompare"], DirectoryCompareOptions>;
  fileRead: GitBaker<["fileData"], FileReadOptions>;
  fileReadAt: GitBaker<["fileDataAt"], FileReadAtOptions>;
  pathExists: GitBaker<["pathExists"], PathExistsOptions>;
  remoteList: GitBaker<["remoteList"], RemoteListOptions>;
  tagList: GitBaker<["tagList"], TagListOptions>;
}

export const defaultGitBakers: () => GitBakers = () => ({
  branchCurrent: notImplemented,
  branchList: notImplemented,
  commitHistory: notImplemented,
  directoryRead: notImplemented,
  directoryStatus: notImplemented,
  directoryCompare: notImplemented,
  fileRead: notImplemented,
  fileReadAt: notImplemented,
  pathExists: notImplemented,
  remoteList: notImplemented,
  tagList: notImplemented,
});

export interface GitValues {
  branchCurrent: GitRequiring<["branchCurrent"], Branch>;
  branchList: GitRequiring<["branchList"], BranchList>;
  remoteList: GitRequiring<["remoteList"], Remote[]>;
  tagList: GitRequiring<["tagList"], Tag[]>;
  fileTree: GitRequiring<["directoryRead"], DirectoryList | FileList>;
  fileStatusTree: GitRequiring<
    ["directoryStatus"],
    { [path: string]: FileStatus }
  >;
  directoryCompare: GitRequiring<
    ["directoryCompare"],
    { [path: string]: CompareStatus }
  >;
  fileData: GitRequiring<["fileRead"], string | undefined>;
  fileDataAt: GitRequiring<["fileReadAt"], string | undefined>;
  pathExists: GitRequiring<["pathExists"], boolean>;
  commitHistory: GitRequiring<["commitHistory"], ReadCommitResult[]>;
}

export const defaultGitValues: () => GitValues = () => ({
  branchCurrent: "master",
  branchList: { local: ["master"] },
  remoteList: [],
  fileTree: {
    type: "directory",
    path: "/",
    children: [],
  },
  fileStatusTree: {},
  directoryCompare: {},
  fileData: "",
  fileDataAt: "",
  pathExists: true,
  commitHistory: [],
  tagList: [],
});

export interface GitContext {
  internal: GitInternal;
  commands: GitCommands;
  bakers: GitBakers;
  values: GitValues;
}

export const defaultGitContext: () => GitContext = () => ({
  internal: defaultGitInternal(),
  commands: defaultGitCommands(),
  bakers: defaultGitBakers(),
  values: defaultGitValues(),
});

export type AuthComponentProps = {
  url: string;
  auth: GitAuth;
  onLoginAttempt: (auth: GitAuth) => void;
};

export type AuthOptions =
  | {
      type: "set";
      value: GitAuth;
    }
  | {
      type: "getter";
      getValue: () => Promise<GitAuth>;
    }
  | {
      type: "element";
      value: React.ComponentType<AuthComponentProps>;
    };

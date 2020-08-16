/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DirectoryList,
  FileList,
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
  BranchList,
  DirectoryStatus,
  DirectoryCompare,
  MergeConflictSolution,
  AuthorType,
  Remote,
  FileStatusOptions,
  FileStatus,
} from "./Queries";
import git, {
  PromiseFsClient,
  HttpClient,
  GitAuth,
  ReadCommitResult,
  PushResult,
  MergeResult,
  FetchResult,
} from "isomorphic-git";
import {
  BranchCreateParams,
  BranchRemoveParams,
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
  RepositoryFetchParams,
  RepositoryPushParams,
  RepositoryStageAndCommitParams,
  TagCreateParams,
  TagRemoveParams,
  BranchRenameParams,
  FileMoveParams,
  BranchRebaseParams,
  BranchMergeParams,
  BranchSolveConflictsParams,
} from "./Commands";
import Emitter from "eventemitter3";
import EventEmitter from "eventemitter3";

const notImplemented = (): any => {
  throw Error("not implemented");
};

export type Path = string;
export const defaultAuthor = {
  name: "react-git-provider",
  email: "dev@publica.re",
};

export interface GitInternal {
  fs: PromiseFsClient;
  git: typeof git;
  http: HttpClient;
  corsProxy?: string;
  basepath: Path;
  loggers: {
    message: (message: string) => void;
    error: (error: string) => void;
  };
  url: string;
  author: AuthorType;
  setAuthor: (author: AuthorType) => void;
  getAuth: (url: string, auth: GitAuth) => Promise<GitAuth>;
  handleAuthSuccess: (url: string, auth: GitAuth) => void;
  handleAuthFailure: (url: string, auth: GitAuth) => void;
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
  corsProxy: undefined,
  basepath: "/",
  loggers: {
    message: console.log,
    error: console.error,
  },
  url: "/",
  async getAuth(): Promise<GitAuth> {
    return {
      username: prompt("User name") || undefined,
      password: prompt("Password") || undefined,
    };
  },
  setAuthor: notImplemented,
  handleAuthFailure: notImplemented,
  handleAuthSuccess: notImplemented,
  author: defaultAuthor,
});

export type GitReturn<T = any> =
  | {
      type: "success";
      value: T;
    }
  | { type: "error"; message: Error };

export type GitWrite<
  Params,
  _Updates extends string[] | "ALL",
  Returns = void
> = (params: Params) => Promise<GitReturn<Returns>>;

export type GitRead<Options, ValueType> = (
  options: Options
) => Promise<GitReturn<ValueType>>;

export interface GitIO {
  branch: {
    create: GitWrite<BranchCreateParams, ["branch.list"]>;
    remove: GitWrite<BranchRemoveParams, ["branch.list"]>;
    rebase: GitWrite<
      BranchRebaseParams,
      [
        "branch.commitHistory",
        "directory.status",
        "directory.read",
        "file.exists",
        "file.data",
        "file.status"
      ],
      void
    >;
    merge: GitWrite<
      BranchMergeParams,
      [
        "branch.commitHistory",
        "directory.status",
        "directory.read",
        "file.exists",
        "file.data",
        "file.status"
      ],
      MergeResult | MergeConflictSolution[]
    >;
    checkout: GitWrite<
      BranchCheckoutParams,
      [
        "branch.commitHistory",
        "branch.current",
        "directory.status",
        "directory.read",
        "file.exists",
        "file.data",
        "file.status"
      ],
      void
    >;
    rename: GitWrite<
      BranchRenameParams,
      ["branch.current", "branch.list"],
      void
    >;
    solveConflicts: GitWrite<
      BranchSolveConflictsParams,
      [
        "branch.commitHistory",
        "directory.status",
        "directory.read",
        "file.exists",
        "file.data",
        "file.status"
      ],
      void
    >;
    current: GitRead<BranchCurrentOptions, string | void>;
    list: GitRead<BranchListOptions, BranchList>;
    commitHistory: GitRead<CommitHistoryOptions, ReadCommitResult[]>;
  };
  directory: {
    make: GitWrite<
      DirectoryMakeParams,
      ["directory.read", "directory.status", "file.exists", "file.read"],
      boolean
    >;
    remove: GitWrite<
      DirectoryRemoveParams,
      ["directory.read", "directory.status", "file.exists", "file.read"],
      boolean
    >;
    read: GitRead<DirectoryReadOptions, DirectoryList | FileList>;
    status: GitRead<DirectoryStatusOptions, DirectoryStatus>;
    compare: GitRead<DirectoryCompareOptions, DirectoryCompare>;
  };
  file: {
    discardChanges: GitWrite<
      FileDiscardChangesParams,
      [
        "directory.read",
        "directory.status",
        "file.read",
        "file.status",
        "file.exists"
      ]
    >;
    remove: GitWrite<
      FileRemoveParams,
      [
        "directory.read",
        "directory.status",
        "file.read",
        "file.status",
        "file.exists"
      ],
      boolean
    >;
    stage: GitWrite<FileStageParams, ["directory.status", "file.status"]>;
    unstage: GitWrite<FileUnstageParams, ["directory.status", "file.status"]>;
    write: GitWrite<
      FileWriteParams,
      [
        "file.read",
        "file.status",
        "file.exists",
        "directory.read",
        "directory.status"
      ],
      boolean
    >;
    move: GitWrite<
      FileMoveParams,
      [
        "file.read",
        "file.status",
        "file.exists",
        "directory.read",
        "directory.status"
      ]
    >;
    read: GitRead<FileReadOptions, string | Uint8Array | undefined>;
    readAt: GitRead<FileReadAtOptions, string | Uint8Array | undefined>;
    exists: GitRead<PathExistsOptions, boolean>;
    status: GitRead<FileStatusOptions, FileStatus>;
  };
  remote: {
    add: GitWrite<RemoteAddParams, ["remote.list", "branch.list"]>;
    delete: GitWrite<RemoteDeleteParams, ["remote.list", "branch.list"]>;
    list: GitRead<RemoteListOptions, Remote[]>;
  };
  repository: {
    clone: GitWrite<
      RepositoryCloneParams,
      [
        "branch.commitHistory",
        "branch.list",
        "branch.current",
        "remote.list",
        "directory.read",
        "directory.status",
        "file.read",
        "file.status",
        "file.exists"
      ]
    >;
    init: GitWrite<
      RepositoryInitParams,
      [
        "branch.commitHistory",
        "branch.list",
        "branch.current",
        "remote.list",
        "directory.read",
        "directory.status",
        "file.read",
        "file.status",
        "file.exists"
      ]
    >;
    commit: GitWrite<
      RepositoryCommitParams,
      ["directory.status", "file.status", "branch.commitHistory"],
      string
    >;
    fetch: GitWrite<RepositoryFetchParams, ["branch.list"], FetchResult>;
    push: GitWrite<
      RepositoryPushParams,
      [
        "directory.status",
        "file.status",
        "branch.list",
        "branch.commitHistory"
      ],
      PushResult
    >;
    stageAndCommit: GitWrite<
      RepositoryStageAndCommitParams,
      ["file.status", "directory.status", "branch.commitHistory"],
      string
    >;
  };
  tag: {
    create: GitWrite<TagCreateParams, ["tag.list"]>;
    remove: GitWrite<TagRemoveParams, ["tag.list"]>;
    list: GitRead<TagListOptions, string[]>;
  };
}
export type AllGitReadOptions = {
  branch: {
    current: BranchCurrentOptions;
    list: BranchListOptions;
    commitHistory: CommitHistoryOptions;
  };
  directory: {
    read: DirectoryReadOptions;
    status: DirectoryStatusOptions;
    compare: DirectoryCompareOptions;
  };
  file: {
    read: FileReadOptions;
    readAt: FileReadAtOptions;
    exists: PathExistsOptions;
    status: FileStatusOptions;
  };
  remote: {
    list: RemoteListOptions;
  };
  tag: {
    list: TagListOptions;
  };
};

export type GitReadOptions = Partial<{
  branch: Partial<{
    current: BranchCurrentOptions;
    list: BranchListOptions;
    commitHistory: CommitHistoryOptions;
  }>;
  directory: Partial<{
    read: DirectoryReadOptions;
    status: DirectoryStatusOptions;
    compare: DirectoryCompareOptions;
  }>;
  file: Partial<{
    read: FileReadOptions;
    readAt: FileReadAtOptions;
    exists: PathExistsOptions;
    status: FileStatusOptions;
  }>;
  remote: Partial<{
    list: RemoteListOptions;
  }>;
  tag: Partial<{
    list: TagListOptions;
  }>;
}>;

export type GitIONS = keyof GitIO;
type GitNSval<T extends GitIONS> = GitIO[T];
export type GitIOCall<T extends GitIONS> = keyof GitNSval<T>;
export type GitIOFunction<
  T extends GitIONS,
  U extends GitIOCall<T>
> = GitIO[T][U];

export type GitReadOptionsNS = keyof AllGitReadOptions;
type GitReadOptionsNSval<T extends GitReadOptionsNS> = AllGitReadOptions[T];
export type GitReadOptionsCall<
  T extends GitReadOptionsNS
> = keyof GitReadOptionsNSval<T>;
export type GitReadOptionsOptions<
  T extends GitReadOptionsNS,
  U extends GitReadOptionsCall<T>
> = AllGitReadOptions[T][U];

export type GitReadValues = Partial<{
  branch: Partial<{
    current: string | void;
    list: BranchList;
    commitHistory: ReadCommitResult[];
  }>;
  directory: Partial<{
    read: DirectoryList | FileList;
    status: DirectoryStatus;
    compare: DirectoryCompare;
  }>;
  file: Partial<{
    read: string | Uint8Array | undefined;
    readAt: string | Uint8Array | undefined;
    exists: boolean;
    status: FileStatus;
  }>;
  remote: Partial<{
    list: Remote[];
  }>;
  tag: Partial<{
    list: string[];
  }>;
}>;

export const defaultGitIO: () => GitIO = () => ({
  branch: {
    create: notImplemented,
    remove: notImplemented,
    rebase: notImplemented,
    merge: notImplemented,
    checkout: notImplemented,
    commitHistory: notImplemented,
    rename: notImplemented,
    solveConflicts: notImplemented,
    current: notImplemented,
    list: notImplemented,
  },
  directory: {
    make: notImplemented,
    remove: notImplemented,
    read: notImplemented,
    status: notImplemented,
    compare: notImplemented,
  },
  file: {
    discardChanges: notImplemented,
    remove: notImplemented,
    stage: notImplemented,
    unstage: notImplemented,
    write: notImplemented,
    move: notImplemented,
    read: notImplemented,
    readAt: notImplemented,
    exists: notImplemented,
    status: notImplemented,
  },
  remote: {
    add: notImplemented,
    delete: notImplemented,
    list: notImplemented,
  },
  repository: {
    clone: notImplemented,
    init: notImplemented,
    commit: notImplemented,
    fetch: notImplemented,
    push: notImplemented,
    stageAndCommit: notImplemented,
  },
  tag: {
    create: notImplemented,
    remove: notImplemented,
    list: notImplemented,
  },
});

export interface GitContext {
  internal: GitInternal;
  io: GitIO;
  emitter: Emitter;
}

export const defaultGitContext: () => GitContext = () => ({
  internal: defaultGitInternal(),
  io: defaultGitIO(),
  emitter: new EventEmitter(),
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

export const defaultAuth: AuthOptions = {
  type: "getter",
  async getValue(): Promise<GitAuth> {
    return {
      username: prompt("User name") || "",
      password: prompt("Password") || "",
    };
  },
};

export type GitComponentState = {
  gitWatch: GitReadOptions;
  gitValues: GitReadValues;
  gitEmitters: { name: string; emitter: any }[];
};

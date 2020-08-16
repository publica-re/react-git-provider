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

/**
 * (internal) a default function
 *
 * @hidden
 */
const notImplemented = (): any => {
  throw Error("not implemented");
};

/**
 * The default author that will be used if none is provided.
 */
export const defaultAuthor = {
  name: "react-git-provider",
  email: "dev@publica.re",
};

/**
 * Internal object for fine manipulations. (for instance, implement new commands)
 */
export interface GitInternal {
  /**
   * The underlying file system
   */
  fs: PromiseFsClient;
  /**
   * The git interface (see `isomorphic-git`)
   */
  git: typeof git;
  /**
   * The http client (see `isomorphic-git`)
   */
  http: HttpClient;
  /**
   * The CORS proxy url, if any (required for some providers like Gitea)
   */
  corsProxy?: string;
  /**
   * The base path for the repository
   */
  basepath: string;
  /**
   * Messages and errors loggers
   */
  loggers: {
    message: (message: string) => void;
    error: (error: string) => void;
  };
  /**
   * Remote url
   */
  url: string;
  /**
   * The author of the commits
   */
  author: AuthorType;
  /**
   * Change the author
   */
  setAuthor: (author: AuthorType) => void;
  /**
   * Get the authentications
   */
  getAuth: (url: string, auth: GitAuth) => Promise<GitAuth>;
  /**
   * Handle a successful authentication
   */
  handleAuthSuccess: (url: string, auth: GitAuth) => void;
  /**
   * Handle an authentication failure
   */
  handleAuthFailure: (url: string, auth: GitAuth) => void;
}

/**
 * Empty internal (throws errors if called)
 */
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

/**
 * IO return type (error handler)
 */
export type GitReturn<T = any> =
  | {
      type: "success";
      value: T;
    }
  | { type: "error"; message: Error };

/**
 * A write IO command
 */
export type GitWrite<
  Params,
  _Updates extends string[] | "ALL",
  Returns = void
> = (params: Params) => Promise<GitReturn<Returns>>;

/**
 * A read IO command
 */
export type GitRead<Options, ValueType> = (
  options: Options
) => Promise<GitReturn<ValueType>>;

/**
 * All of the implemented IOs
 */
export interface GitIO {
  /**
   * IOs related to branches
   */
  branch: {
    /**
     * Create a new branch
     */
    create: GitWrite<BranchCreateParams, ["branch.list"]>;
    /**
     * Remove a given branch
     */
    remove: GitWrite<BranchRemoveParams, ["branch.list"]>;
    /**
     * Rebase a branch on another or on a commit
     */
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
    /**
     * Merge a branch into another
     */
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
    /**
     * Checkout a branch or a commit into current branch
     */
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
    /**
     * Rename a branch
     */
    rename: GitWrite<
      BranchRenameParams,
      ["branch.current", "branch.list"],
      void
    >;
    /**
     * (internal) solves merge conflicts given a list of patches
     */
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
    /**
     * Get the current branch
     */
    current: GitRead<BranchCurrentOptions, string>;
    /**
     * List all branches (remote included)
     */
    list: GitRead<BranchListOptions, BranchList>;
    /**
     * List all commits for the current branch
     */
    commitHistory: GitRead<CommitHistoryOptions, ReadCommitResult[]>;
  };
  /**
   * All directory related IOs
   */
  directory: {
    /**
     * Create a new directory
     */
    make: GitWrite<
      DirectoryMakeParams,
      ["directory.read", "directory.status", "file.exists", "file.read"],
      boolean
    >;
    /**
     * Remote a given directory and its subdirectories
     */
    remove: GitWrite<
      DirectoryRemoveParams,
      ["directory.read", "directory.status", "file.exists", "file.read"],
      boolean
    >;
    /**
     * List all files in a given directory
     */
    read: GitRead<DirectoryReadOptions, DirectoryList | FileList>;
    /**
     * Returns the statuses of all files in a directory (and subdirectories)
     */
    status: GitRead<DirectoryStatusOptions, DirectoryStatus>;
    /**
     * Compare a directory at two different commits
     */
    compare: GitRead<DirectoryCompareOptions, DirectoryCompare>;
  };
  /**
   * File related IOs
   */
  file: {
    /**
     * Discard changes to a file
     */
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
    /**
     * Remove a file
     */
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
    /**
     * Statge a file
     */
    stage: GitWrite<FileStageParams, ["directory.status", "file.status"]>;
    /**
     * Stage a directory
     */
    unstage: GitWrite<FileUnstageParams, ["directory.status", "file.status"]>;
    /**
     * Write to a file
     */
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
    /**
     * Move a file
     */
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
    /**
     * Read a file
     */
    read: GitRead<FileReadOptions, string | Uint8Array | undefined>;
    /**
     * Read a file at a given commit or in a given branch
     */
    readAt: GitRead<FileReadAtOptions, string | Uint8Array | undefined>;
    /**
     * Check if a file exists
     */
    exists: GitRead<PathExistsOptions, boolean>;
    /**
     * Get a file's git status
     */
    status: GitRead<FileStatusOptions, FileStatus>;
  };
  /**
   * Remote related IOs
   */
  remote: {
    /**
     * Add a remote
     */
    add: GitWrite<RemoteAddParams, ["remote.list", "branch.list"]>;
    /**
     * Delete a remote
     */
    delete: GitWrite<RemoteDeleteParams, ["remote.list", "branch.list"]>;
    /**
     * List all remotes
     */
    list: GitRead<RemoteListOptions, Remote[]>;
  };
  /**
   * Repository related IOs
   */
  repository: {
    /**
     * Clone a repositry
     */
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
    /**
     * Initialize a new repository
     */
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
    /**
     * Commit changes
     */
    commit: GitWrite<
      RepositoryCommitParams,
      ["directory.status", "file.status", "branch.commitHistory"],
      string
    >;
    /**
     * Fetch changes
     */
    fetch: GitWrite<RepositoryFetchParams, ["branch.list"], FetchResult>;
    /**
     * Push changes
     */
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
    /**
     * Stage all changes and commit
     */
    stageAndCommit: GitWrite<
      RepositoryStageAndCommitParams,
      ["file.status", "directory.status", "branch.commitHistory"],
      string
    >;
  };
  /**
   * Tag related IOs
   */
  tag: {
    /**
     * Create a new tag
     */
    create: GitWrite<TagCreateParams, ["tag.list"]>;
    /**
     * Remove a given tag
     */
    remove: GitWrite<TagRemoveParams, ["tag.list"]>;
    /**
     * List all tags
     */
    list: GitRead<TagListOptions, string[]>;
  };
}
/**
 * (internal) all options of readable data
 *
 * @hidden
 */
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

/**
 * @hidden
 */
export type GitIONS = keyof GitIO;
/**
 * @hidden
 */
type GitNSval<T extends GitIONS> = GitIO[T];
/**
 * @hidden
 */
export type GitIOCall<T extends GitIONS> = keyof GitNSval<T>;
/**
 * @hidden
 */
export type GitIOFunction<
  T extends GitIONS,
  U extends GitIOCall<T>
> = GitIO[T][U];

/**
 * @hidden
 */
export type GitReadOptionsNS = keyof AllGitReadOptions;
/**
 * @hidden
 */
type GitReadOptionsNSval<T extends GitReadOptionsNS> = AllGitReadOptions[T];
/**
 * @hidden
 */
export type GitReadOptionsCall<
  T extends GitReadOptionsNS
> = keyof GitReadOptionsNSval<T>;
/**
 * @hidden
 */
export type GitReadOptionsOptions<
  T extends GitReadOptionsNS,
  U extends GitReadOptionsCall<T>
> = AllGitReadOptions[T][U];

/**
 * All values that can be listened to.
 */
export type GitReadValues = Partial<{
  /**
   * Branch-related values
   */
  branch: Partial<{
    /**
     * The current branch
     */
    current: string;
    /**
     * All branches (inclusive remotes)
     */
    list: BranchList;
    /**
     * A list of all commits
     */
    commitHistory: ReadCommitResult[];
  }>;
  /**
   * Directory-related values
   */
  directory: Partial<{
    /**
     * All files in a directory
     */
    read: DirectoryList | FileList;
    /**
     * Git statuses of all files
     */
    status: DirectoryStatus;
    /**
     * Compare a directory in two branches or at two commits
     */
    compare: DirectoryCompare;
  }>;
  /**
   * File-reated values
   */
  file: Partial<{
    /**
     * Read a file
     */
    read: string | Uint8Array | undefined;
    /**
     * Read a file at a given commit
     */
    readAt: string | Uint8Array | undefined;
    /**
     * Check if a file exists
     */
    exists: boolean;
    /**
     * Git status of a file
     */
    status: FileStatus;
  }>;
  /**
   * Remote-related values
   */
  remote: Partial<{
    /**
     * List all remotes
     */
    list: Remote[];
  }>;
  /**
   * Tag-related values
   */
  tag: Partial<{
    /**
     * List all tags
     */
    list: string[];
  }>;
}>;

/**
 * Empty IO (throws errors if called)
 */
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

/**
 * A git context (provided by the provider)
 */
export interface GitContext {
  /**
   * Internal commands
   */
  internal: GitInternal;
  /**
   * IO commands
   */
  io: GitIO;
  /**
   * EventEmitter triggered when a write IO command is run
   */
  emitter: Emitter;
}

/**
 * A default context
 */
export const defaultGitContext: () => GitContext = () => ({
  internal: defaultGitInternal(),
  io: defaultGitIO(),
  emitter: new EventEmitter(),
});

/**
 * Props for an authentication component.
 *
 * @param url  the url that needs to be authenticated
 * @param auth the current auth (e.g. on failure)
 * @param onLoginAttempt a callback to be triggered to attempt an authentication
 */
export type AuthComponentProps = {
  url: string;
  auth: GitAuth;
  onLoginAttempt: (auth: GitAuth) => void;
};

/**
 * Auth getter types
 *
 * set = provide a static authentication
 *
 * getter = provide a function that returns an authentication
 *
 * element = provide a React element that triggers an authentication attempt (onLoginAttempt)
 */
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

/**
 * Default auth getter (with window.prompt)
 */
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

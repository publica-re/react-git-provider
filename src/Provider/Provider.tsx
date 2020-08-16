import * as React from "react";
import pathUtils from "path";
import bind from "bind-decorator";

import http from "isomorphic-git/http/web";
import git, { PromiseFsClient, GitAuth } from "isomorphic-git";
import FS from "@isomorphic-git/lightning-fs";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Context from "../Context";
import {
  GitInternal,
  GitContext,
  AuthOptions,
  defaultGitInternal,
  defaultAuth,
  defaultAuthor,
  GitWrite,
  GitReturn,
  GitRead,
} from "../Types";
import EventEmitter from "eventemitter3";
import {
  AuthorType,
  branchCurrent,
  branchList,
  commitHistory,
  directoryRead,
  directoryStatus,
  directoryCompare,
  fileRead,
  fileReadAt,
  pathExists,
  tagList,
  remoteList,
  fileStatus,
} from "../Queries";
import {
  branchCreate,
  branchRemove,
  branchRebase,
  branchMerge,
  branchCheckout,
  branchRename,
  branchSolveConflicts,
  directoryMake,
  directoryRemove,
  fileDiscardChanges,
  fileRemove,
  fileStage,
  fileUnstage,
  fileWrite,
  fileMove,
  tagRemove,
  tagCreate,
  repositoryStageAndCommit,
  repositoryPush,
  repositoryFetch,
  repositoryCommit,
  repositoryInit,
  repositoryClone,
  remoteAdd,
  remoteDelete,
} from "../Commands";

export interface GitProps {
  url: string;
  corsProxy: string | false;
  basepath: string;
  author: { name: string; email: string };
  auth: AuthOptions;
  loader: React.ComponentType<{ message: string }>;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
  children?: React.ReactNode;
}

export const defaultLoader = (({ message }): React.ReactNode => {
  return <span>{message}</span>;
}) as React.FC<{ message: string }>;

export const defaultGitProps: () => Partial<GitProps> = () => ({
  basepath: "/",
  author: defaultAuthor,
  auth: defaultAuth,
  loader: defaultLoader,
  onMessage: (message: string): void => console.log("[GIT-CONSUMER]", message),
  onError: (message: string): void => console.error("[GIT-CONSUMER]", message),
});

export type GitAuthStatus =
  | {
      type: "none";
    }
  | { type: "waiting"; url: string; auth: GitAuth }
  | { type: "attempt"; url: string; auth: GitAuth }
  | { type: "failed"; url: string; auth: GitAuth }
  | { type: "success"; url: string; auth: GitAuth };

export interface GitState {
  isLoaded: boolean;
  authStatus: GitAuthStatus;
  messageLog: string[];
  errorLog: string[];
  author: { name: string; email: string };
}

export const defaultGitState: () => GitState = () => ({
  isLoaded: false,
  authStatus: { type: "none" },
  messageLog: [],
  errorLog: [],
  author: defaultGitInternal().author,
});

export default class Provider extends React.Component<GitProps, GitState> {
  private fs: PromiseFsClient = new FS(this.props.url);
  private emitter: EventEmitter = new EventEmitter();

  public static defaultProps = defaultGitProps();

  constructor(props: GitProps) {
    super(props);
    this.state = {
      ...defaultGitState(),
      author: props.author,
    };
  }

  @bind
  private async handleAuth(url: string, auth: GitAuth): Promise<GitAuth> {
    this.setState({
      authStatus: { type: "waiting", url: url, auth: auth },
    });
    while (this.state.authStatus.type === "waiting") {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (this.state.authStatus.type === "attempt") {
      return this.state.authStatus.auth;
    } else {
      return await this.handleAuth(url, auth);
    }
  }

  @bind
  private handleLoginAttempt(auth: GitAuth): void {
    this.setState({
      authStatus: {
        type: "attempt",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        url: (this.state.authStatus as any).url || "",
        auth: auth,
      },
    });
  }

  @bind
  private async getAuth(url: string, auth: GitAuth): Promise<GitAuth> {
    if (this.state.authStatus.type === "success") {
      return this.state.authStatus.auth;
    } else if (this.props.auth.type === "getter") {
      return await this.props.auth.getValue();
    } else if (this.props.auth.type === "set") {
      return this.props.auth.value;
    }
    return await this.handleAuth(url, auth);
  }

  @bind
  private handleAuthFailure(url: string, auth: GitAuth): void {
    this.setState({ authStatus: { type: "failed", url: url, auth: auth } });
    this.handleAuth(url, auth);
  }

  @bind
  private handleAuthSuccess(url: string, auth: GitAuth): void {
    this.setState({ authStatus: { type: "success", url: url, auth: auth } });
  }

  @bind
  private handleMessage(message: string): void {
    this.setState(
      ({ messageLog }) => ({ messageLog: [message, ...messageLog] }),
      () => this.props.onMessage(message)
    );
  }

  @bind
  private handleError(error: string): void {
    this.setState(
      ({ errorLog }) => ({ errorLog: [error, ...errorLog] }),
      () => this.props.onError(error)
    );
  }

  /*
  @bind
  private handleProgress({
    phase,
    loaded,
    total,
  }: {
    phase: string;
    loaded: number;
    total: number;
  }): void {
    if (loaded !== undefined && total !== undefined)
      this.handleMessage(
        `${phase} ${Math.round((loaded / (total + 1)) * 100)}%`
      );
    else this.handleMessage(phase);
  }
  */

  @bind
  async componentDidMount(): Promise<void> {
    this.handleMessage("initializing git");
    try {
      await this.setup();
    } catch (e) {
      this.handleError(e);
      await this.setup(false);
    }
    this.handleMessage("git ready");
    this.setState({ isLoaded: true });
  }

  @bind
  private async setup(checkout?: boolean): Promise<void> {
    await this.gitContext().io.repository.clone({
      uri: this.props.url,
      noCheckout: checkout !== undefined ? !checkout : undefined,
    });
  }

  @bind
  private setAuthor(author: AuthorType): void {
    this.setState({ author: author });
  }

  @bind
  private gitInternal(): GitInternal {
    const { fs, getAuth } = this;
    const { url } = this.props;
    const basepath = `/${pathUtils.relative("/", this.props.basepath)}`;
    const corsProxy =
      this.props.corsProxy === false
        ? undefined
        : this.props.corsProxy.replace(/\/^/, "");
    return {
      fs: fs,
      git: git,
      http: http,
      corsProxy: corsProxy,
      basepath: basepath,
      loggers: {
        message: this.handleMessage,
        error: this.handleError,
      },
      url: url,
      setAuthor: this.setAuthor,
      author: this.state.author,
      getAuth: getAuth,
      handleAuthFailure: this.handleAuthFailure,
      handleAuthSuccess: this.handleAuthSuccess,
    };
  }

  @bind
  private gitContext(): GitContext {
    return {
      internal: this.gitInternal(),
      io: {
        branch: {
          create: this.performIoWrite(branchCreate, ["branch.list"]),
          remove: this.performIoWrite(branchRemove, ["branch.list"]),
          rebase: this.performIoWrite(branchRebase, [
            "branch.commitHistory",
            "directory.status",
            "directory.read",
            "file.exists",
            "file.data",
            "file.status",
          ]),
          merge: this.performIoWrite(branchMerge, [
            "branch.commitHistory",
            "directory.status",
            "directory.read",
            "file.exists",
            "file.data",
            "file.status",
          ]),
          checkout: this.performIoWrite(branchCheckout, [
            "branch.current",
            "branch.commitHistory",
            "directory.status",
            "directory.read",
            "file.exists",
            "file.data",
            "file.status",
          ]),
          rename: this.performIoWrite(branchRename, [
            "branch.current",
            "branch.list",
          ]),
          solveConflicts: this.performIoWrite(branchSolveConflicts, [
            "branch.commitHistory",
            "directory.status",
            "directory.read",
            "file.exists",
            "file.data",
            "file.status",
          ]),
          current: this.performIoRead(branchCurrent),
          list: this.performIoRead(branchList),
          commitHistory: this.performIoRead(commitHistory),
        },
        directory: {
          make: this.performIoWrite(directoryMake, [
            "directory.read",
            "directory.status",
            "file.exists",
            "file.read",
            "file.status",
          ]),
          remove: this.performIoWrite(directoryRemove, [
            "directory.read",
            "directory.status",
            "file.exists",
            "file.read",
            "file.status",
          ]),
          read: this.performIoRead(directoryRead),
          status: this.performIoRead(directoryStatus),
          compare: this.performIoRead(directoryCompare),
        },
        file: {
          discardChanges: this.performIoWrite(fileDiscardChanges, [
            "directory.read",
            "directory.status",
            "file.exists",
            "file.read",
            "file.status",
          ]),
          remove: this.performIoWrite(fileRemove, [
            "directory.read",
            "directory.status",
            "file.exists",
            "file.read",
            "file.status",
          ]),
          stage: this.performIoWrite(fileStage, [
            "directory.status",
            "file.status",
          ]),
          unstage: this.performIoWrite(fileUnstage, [
            "directory.status",
            "file.status",
          ]),
          write: this.performIoWrite(fileWrite, [
            "directory.read",
            "directory.status",
            "file.exists",
            "file.read",
            "file.status",
          ]),
          move: this.performIoWrite(fileMove, [
            "directory.read",
            "directory.status",
            "file.exists",
            "file.read",
            "file.status",
          ]),
          read: this.performIoRead(fileRead),
          readAt: this.performIoRead(fileReadAt),
          exists: this.performIoRead(pathExists),
          status: this.performIoRead(fileStatus),
        },
        remote: {
          add: this.performIoWrite(remoteAdd, ["remote.list", "branch.list"]),
          delete: this.performIoWrite(remoteDelete, [
            "remote.list",
            "branch.list",
          ]),
          list: this.performIoRead(remoteList),
        },
        repository: {
          clone: this.performIoWrite(repositoryClone, [
            "branch.commitHistory",
            "branch.list",
            "branch.current",
            "remote.list",
            "directory.read",
            "directory.status",
            "file.read",
            "file.status",
            "file.exists",
          ]),
          init: this.performIoWrite(repositoryInit, [
            "branch.commitHistory",
            "branch.list",
            "branch.current",
            "remote.list",
            "directory.read",
            "directory.status",
            "file.read",
            "file.status",
            "file.exists",
          ]),
          commit: this.performIoWrite(repositoryCommit, [
            "directory.status",
            "file.status",
            "branch.commitHistory",
          ]),
          fetch: this.performIoWrite(repositoryFetch, [
            "branch.commitHistory",
            "branch.list",
            "branch.current",
            "remote.list",
            "directory.read",
            "directory.status",
            "file.read",
            "file.status",
            "file.exists",
          ]),
          push: this.performIoWrite(repositoryPush, [
            "directory.status",
            "file.status",
            "branch.commitHistory",
            "branch.list",
          ]),
          stageAndCommit: this.performIoWrite(repositoryStageAndCommit, [
            "file.status",
            "directory.status",
            "branch.commitHistory",
          ]),
        },
        tag: {
          create: this.performIoWrite(tagCreate, ["tag.list"]),
          remove: this.performIoWrite(tagRemove, ["tag.list"]),
          list: this.performIoRead(tagList),
        },
      },
      emitter: this.emitter,
    };
  }

  @bind
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private triggerUpdates(events: { name: string; options?: any[] }[]): boolean {
    if (events.length > 1) {
      const thisUpdate = this.triggerUpdates([events[0]]);
      const nextUpdate = this.triggerUpdates(events.slice(1));
      return thisUpdate && nextUpdate;
    }
    const { name, options } = events[0];
    return this.emitter.emit(name, ...(options || []));
  }

  @bind
  private performIoWrite<Params, Updates extends string[], Returns>(
    fn: (internal: GitInternal) => (params: Params) => Promise<Returns>,
    updates: Updates
  ): GitWrite<Params, Updates, Returns> {
    return async (params: Params): Promise<GitReturn<Returns>> => {
      try {
        const value = await fn(this.gitInternal())(params);
        this.triggerUpdates(updates.map((event) => ({ name: event })));
        return {
          type: "success",
          value: value,
        };
      } catch (e) {
        this.props.onError(e);
        return {
          type: "error",
          message: e,
        } as GitReturn<Returns>;
      }
    };
  }

  @bind
  private performIoRead<Options, Returns>(
    fn: (internal: GitInternal) => (options: Options) => Promise<Returns>
  ): GitRead<Options, Returns> {
    return async (options: Options): Promise<GitReturn<Returns>> => {
      try {
        const parsed = await fn(this.gitInternal())(options);
        return {
          type: "success",
          value: parsed,
        };
      } catch (e) {
        return {
          type: "error",
          message: e,
        } as GitReturn<Returns>;
      }
    };
  }

  render(): React.ReactNode {
    let output: React.ReactNode = null;
    if (
      this.state.authStatus.type === "waiting" &&
      this.props.auth.type === "element"
    ) {
      output = (
        <this.props.auth.value
          url={this.state.authStatus.url}
          auth={this.state.authStatus.auth}
          onLoginAttempt={this.handleLoginAttempt}
        />
      );
    } else if (this.props.loader !== undefined && !this.state.isLoaded) {
      output = <this.props.loader message={this.state.messageLog[0]} />;
    }
    return (
      <React.Suspense
        fallback={<this.props.loader message={this.state.messageLog[0]} />}
      >
        {output}
        <Context.Provider value={this.gitContext()}>
          {output === null && this.props.children}
        </Context.Provider>
      </React.Suspense>
    );
  }
}

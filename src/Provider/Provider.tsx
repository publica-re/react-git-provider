import * as React from "react";

import bind from "bind-decorator";

import http from "isomorphic-git/http/web";
import git, { PromiseFsClient, GitAuth } from "isomorphic-git";
import FS from "@isomorphic-git/lightning-fs";

import {
  branchCreate,
  branchRemove,
  branchSwitch,
  directoryMake,
  directoryRemove,
  branchCheckout,
  repositoryPush,
  repositoryPull,
  repositoryInit,
  repositoryCommit,
  repositoryClone,
  remoteAdd,
  remoteDelete,
  fileWrite,
  fileUnstage,
  fileStage,
  fileRemove,
  fileDiscardChanges,
  repositoryStageAndCommit,
  tagCreate,
  tagRemove,
} from "../Commands";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Context from "../Context";
import {
  GitValues,
  GitContext,
  defaultGitValues,
  GitUpdating,
  GitUnboundCommand,
  GitBaker,
  GitInternal,
  GitBakers,
} from "../Types";
import {
  branchCurrent,
  branchList,
  directoryStatus,
  fileRead,
  directoryRead,
  pathExists,
  fileReadAt,
  commitHistory,
  remoteList,
  tagList,
} from "../Queries";

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
      value: React.ComponentType<{
        auth: GitAuth;
        onLoginAttempt: (auth: GitAuth) => void;
      }>;
    };

export interface GitProps {
  uri: string;
  corsProxy: string;
  basepath: string;
  author: { name: string; email: string };
  auth: AuthOptions;
  loader: React.ComponentType<{ message: string }>;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
  children?: React.ReactNode;
}

export const defaultGitProps: () => Partial<GitProps> = () => ({
  corsProxy: "https://cors.isomorphic-git.org/",
  basepath: "/",
  author: { name: "react-git-provider", email: "dev@publica.re" },
  auth: {
    type: "getter",
    async getValue(): Promise<GitAuth> {
      return {
        username: prompt("User name") || "",
        password: prompt("Password") || "",
      };
    },
  },
  loader: (((({ message }): React.ReactNode => {
    return <span>{message}</span>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as React.FC<{ message: string }>) as unknown) as any,
  onMessage: (message: string): void => console.log("[GIT-CONSUMER]", message),
  onError: (message: string): void => console.error("[GIT-CONSUMER]", message),
});

export type GitAuthStatus =
  | {
      type: "none";
    }
  | { type: "waiting"; auth: GitAuth }
  | { type: "attempt"; auth: GitAuth }
  | { type: "failed"; auth: GitAuth }
  | { type: "success"; auth: GitAuth };

export interface GitState {
  isLoaded: boolean;
  authStatus: GitAuthStatus;
  messageLog: string[];
  errorLog: string[];
  values: GitValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastOptions: Record<string, any>;
}

export const defaultGitState: () => GitState = () => ({
  isLoaded: false,
  authStatus: { type: "none" },
  messageLog: [],
  errorLog: [],
  values: defaultGitValues(),
  lastOptions: {},
});

export default class Provider extends React.Component<GitProps, GitState> {
  private fs: PromiseFsClient = new FS(this.props.uri);

  public static defaultProps = defaultGitProps();

  constructor(props: GitProps) {
    super(props);
    this.state = defaultGitState();
  }

  @bind
  private async handleAuth(url: string, auth: GitAuth): Promise<GitAuth> {
    this.setState({
      authStatus: { type: "waiting", auth: auth },
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
    this.setState({ authStatus: { type: "attempt", auth: auth } });
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
  private handleAuthFailure(_url: string, auth: GitAuth): void {
    this.setState({ authStatus: { type: "failed", auth: auth } });
    this.handleAuth(_url, auth);
  }

  @bind
  private handleAuthSuccess(_url: string, auth: GitAuth): void {
    this.setState({ authStatus: { type: "success", auth: auth } });
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
  private async setup(checkout = true): Promise<void> {
    await git.clone({
      fs: this.fs,
      http: http,
      dir: this.props.basepath,
      corsProxy: this.props.corsProxy,
      url: this.props.uri,
      onAuth: this.getAuth,
      onAuthFailure: this.handleAuthFailure,
      onAuthSuccess: this.handleAuthSuccess,
      onMessage: this.handleMessage,
      onProgress: this.handleProgress,
      noCheckout: !checkout,
    });
  }

  private gitContext: GitContext = {
    internal: {
      fs: this.fs,
      git: git,
      http: http,
      corsProxy: this.props.corsProxy,
      basepath: this.props.basepath,
      events: {
        message: this.handleMessage,
        error: this.handleError,
      },
      author: this.props.author,
      getAuth: this.getAuth,
    },
    commands: {
      branchCreate: this.doUpdate(["branchList"], branchCreate),
      branchRemove: this.doUpdate(
        [
          "branchList",
          "branchCurrent",
          "existingPaths",
          "directoryRead",
          "directoryStatus",
          "fileRead",
          "existingPaths",
          "commitHistory",
        ],
        branchRemove
      ),
      branchSwitch: this.doUpdate(
        [
          "branchList",
          "branchCurrent",
          "existingPaths",
          "directoryRead",
          "directoryStatus",
          "fileRead",
          "existingPaths",
          "commitHistory",
        ],
        branchSwitch
      ),
      branchCheckout: this.doUpdate(
        [
          "branchList",
          "branchCurrent",
          "existingPaths",
          "directoryRead",
          "directoryStatus",
          "fileRead",
          "existingPaths",
          "commitHistory",
        ],
        branchCheckout
      ),
      directoryMake: this.doUpdate(
        ["directoryRead", "directoryStatus", "existingPaths"],
        directoryMake
      ),
      directoryRemove: this.doUpdate(
        ["directoryRead", "directoryStatus", "fileRead", "existingPaths"],
        directoryRemove
      ),
      fileDiscardChanges: this.doUpdate(
        ["directoryRead", "directoryStatus", "fileRead"],
        fileDiscardChanges
      ),
      fileRemove: this.doUpdate(
        ["directoryRead", "directoryStatus", "fileRead", "existingPaths"],
        fileRemove
      ),
      fileStage: this.doUpdate(["directoryStatus"], fileStage),
      fileUnstage: this.doUpdate(["directoryStatus"], fileUnstage),
      fileWrite: this.doUpdate(
        ["fileRead", "existingPaths", "directoryStatus", "directoryRead"],
        fileWrite
      ),
      remoteDelete: this.doUpdate(["remoteList", "branchList"], remoteDelete),
      remoteAdd: this.doUpdate(["remoteList", "branchList"], remoteAdd),
      repositoryClone: this.doUpdate(
        [
          "branchList",
          "directoryRead",
          "directoryStatus",
          "fileRead",
          "existingPaths",
          "commitHistory",
        ],
        repositoryClone
      ),
      repositoryCommit: this.doUpdate(
        ["directoryStatus", "commitHistory"],
        repositoryCommit
      ),
      repositoryInit: this.doUpdate(
        [
          "branchList",
          "directoryRead",
          "directoryStatus",
          "fileRead",
          "existingPaths",
          "commitHistory",
        ],
        repositoryInit
      ),
      repositoryPull: this.doUpdate(
        [
          "branchList",
          "directoryRead",
          "directoryStatus",
          "fileRead",
          "existingPaths",
          "commitHistory",
        ],
        repositoryPull
      ),
      repositoryPush: this.doUpdate(
        [
          "branchList",
          "directoryRead",
          "directoryStatus",
          "fileRead",
          "commitHistory",
        ],
        repositoryPush
      ),
      repositoryStageAndCommit: this.doUpdate(
        ["directoryStatus", "commitHistory"],
        repositoryStageAndCommit
      ),
      tagCreate: this.doUpdate(["tagList"], tagCreate),
      tagRemove: this.doUpdate(["tagList"], tagRemove),
    },
    bakers: {
      branchCurrent: this.doBaking(["branchCurrent"], branchCurrent),
      branchList: this.doBaking(["branchList"], branchList),
      commitHistory: this.doBaking(["commitHistory"], commitHistory),
      directoryRead: this.doBaking(["fileTree"], directoryRead),
      directoryStatus: this.doBaking(["fileStatusTree"], directoryStatus),
      fileRead: this.doBaking(["fileData"], fileRead),
      fileReadAt: this.doBaking(["fileDataAt"], fileReadAt),
      existingPaths: this.doBaking(["existingPaths"], pathExists),
      remoteList: this.doBaking(["remoteList"], remoteList),
      tagList: this.doBaking(["tagList"], tagList),
    },
    values: this.state?.values,
  };

  @bind
  private doUpdate<
    Updates extends (keyof GitBakers)[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Params extends Record<string, any>,
    Returns
  >(
    updates: Updates,
    command: GitUnboundCommand<Params, Returns>
  ): GitUpdating<Updates, Params, Returns> {
    return (async (params: Params): Promise<Returns> => {
      const out = await command(this.gitContext.internal)(params);
      for (const update of updates) {
        if (this.state.lastOptions[update] !== undefined) {
          this.gitContext.bakers[update](this.state.lastOptions[update]);
        }
      }
      return out;
    }) as GitUpdating<Updates, Params, Returns>;
  }

  @bind
  private doBaking<
    Bakes extends (keyof GitValues)[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Options extends Record<string, any>
  >(
    bakes: Bakes,
    baker: (
      internal: GitInternal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => (options: Options) => Promise<any>
  ): GitBaker<Bakes, Options> {
    return (async (options?: Options) => {
      const value = await baker(this.gitContext.internal)(
        options || ({} as Options)
      );
      this.setState(({ lastOptions }) => ({
        lastOptions: {
          ...lastOptions,
          [baker.name]: options,
        },
      }));
      for (const bake of bakes) {
        this.setState(({ values }) => ({
          values: { ...values, [bake]: value },
        }));
      }
      return value;
    }) as GitBaker<Bakes>;
  }

  render(): React.ReactNode {
    let output: React.ReactNode = null;
    if (
      this.state.authStatus.type === "waiting" &&
      this.props.auth.type === "element"
    ) {
      output = (
        <this.props.auth.value
          auth={this.state.authStatus.auth}
          onLoginAttempt={this.handleLoginAttempt}
        />
      );
    } else if (this.props.loader !== undefined && !this.state.isLoaded) {
      output = <this.props.loader message={this.state.messageLog[0]} />;
    }
    return (
      <React.Suspense fallback={"loading"}>
        {output}
        <Context.Provider
          value={{ ...this.gitContext, values: this.state.values }}
        >
          {output === null && this.props.children}
        </Context.Provider>
      </React.Suspense>
    );
  }
}

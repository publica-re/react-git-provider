import * as React from "react";

import bind from "bind-decorator";

import http from "isomorphic-git/http/web";
import git, { PromiseFsClient } from "isomorphic-git";
import FS from "@isomorphic-git/lightning-fs";

import Context from "../Context";

export interface GitProps {
  uri: string;
  author: { name: string; email: string };
  corsProxy?: string;
  onMessage?: (message: string) => void;
  onProgress?: (event: {
    phase: string;
    loaded: number;
    total: number;
  }) => void;
  children?: React.ReactNode;
}

export interface GitState {
  isLoaded: boolean;
  changeCount: number;
}

export default class Provider extends React.Component<GitProps, GitState> {
  private fs: PromiseFsClient = new FS(this.props.uri);
  private pfs = this.fs.promises;

  constructor(props: GitProps) {
    super(props);

    this.state = {
      isLoaded: false,
      changeCount: 0,
    };
  }

  onAuth() {}
  onAuthFailure() {}
  onAuthSuccess() {}

  @bind
  doChange(): void {
    this.setState((prev) => ({
      changeCount: prev.changeCount + 1,
    }));
  }

  @bind
  async componentDidMount(): Promise<void> {
    await this.setup();
    this.setState({ isLoaded: true });
  }

  @bind
  private async setup(): Promise<void> {
    await git.clone({
      fs: this.fs,
      http: http,
      dir: "/",
      corsProxy: this.props.corsProxy,
      url: this.props.uri,
      onAuth: this.onAuth,
      onAuthFailure: this.onAuthFailure,
      onAuthSuccess: this.onAuthSuccess,
      onMessage: this.props.onMessage,
      onProgress: this.props.onProgress,
    });
    this.doChange();
  }

  @bind
  async listFiles(
    path: string
  ): Promise<
    {
      path: string;
      fileName: string;
      type: "file" | "directory";
    }[]
  > {
    const files = (await this.pfs.readdir(path)) as string[];
    const data = await Promise.all(
      files.map(async (file) => {
        const stat = await this.pfs.stat(`${path}/${file}`);
        const isFile = await stat.isFile();
        return {
          path: path,
          fileName: file,
          type: isFile ? "file" : "directory",
        } as {
          path: string;
          fileName: string;
          type: "file" | "directory";
        };
      })
    );
    return data;
  }

  render(): React.ReactNode {
    if (this.state.isLoaded) {
      return (
        <Context.Provider
          value={{
            internal: {
              fs: this.pfs,
              git: git,
              http: http,
            },
            listFiles: this.listFiles,
          }}
        >
          {this.props.children}
        </Context.Provider>
      );
    }
    return <span>Loading...</span>;
  }
}

import React, { Suspense } from "react";
import Git from "react-git-provider";
import "./i18n";
import { Loader, ActionMenu, Auth, Editor } from "./Components";

import { Fabric, Stack, Layer, mergeStyles } from "@fluentui/react";

import { initializeIcons } from "office-ui-fabric-react/lib/Icons";

initializeIcons();

export interface AppState {
  directoryPath: string;
  filePath: string | null;
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      directoryPath: "/",
      filePath: null,
    };
    this.setDirectoryPath = this.setDirectoryPath.bind(this);
    this.setFilePath = this.setFilePath.bind(this);
  }

  setDirectoryPath(newPath: string) {
    this.setState({ directoryPath: newPath });
  }

  setFilePath(newPath: string) {
    this.setState({ filePath: newPath });
  }

  render() {
    return (
      <Suspense fallback="loading">
        <Git.Provider
          uri={"https://git.publica.re/demo/work.git"}
          corsProxy={"http://localhost:9415"}
          author={{ name: "demo", email: "demo@publica.re" }}
          basepath={"/test"}
          loader={Loader}
          auth={{ type: "element", value: Auth }}
        >
          <Fabric>
            <Stack horizontal style={{ overflow: "hidden" }}>
              <div className={contentClass}>
                {this.state.filePath ? (
                  <Editor filePath={this.state.filePath} />
                ) : null}
              </div>
            </Stack>
            <Layer>
              <ActionMenu
                onEdit={(path) => this.setState({ filePath: path })}
              />
            </Layer>
          </Fabric>
        </Git.Provider>
      </Suspense>
    );
  }
}

const contentClass = mergeStyles([
  {
    width: "100vw",
    height: "calc(100vh - 4em)",
  },
]);

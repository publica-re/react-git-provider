import React from "react";

import Git from "react-git-provider";

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
      <Git.Provider
        uri={"https://github.com/publica-re/react-xml-transformer.git"}
        corsProxy={"http://localhost:9415"}
        author={{ name: "demo", email: "dv@bmgr.me" }}
        onMessage={console.log}
      >
        <div className="app">
          <Git.FileManager path={"/"} />
        </div>
      </Git.Provider>
    );
  }
}

import React from "react";
import bind from "bind-decorator";
import "./i18n";
import { View, Dialog, TaskBar } from "./Components";

import { DefaultButton, mergeStyles } from "@fluentui/react";

export interface AppState {
  filePath: string | null;
  filePickerOpen: boolean;
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      filePath: null,
      filePickerOpen: false,
    };
  }

  @bind
  setFilePath(newPath: string) {
    this.setState({ filePath: newPath }, this.closeFilePicker);
  }

  @bind
  openFilePicker() {
    this.setState({ filePickerOpen: true });
  }

  @bind
  closeFilePicker() {
    this.setState({ filePickerOpen: false });
  }

  render() {
    return (
      <TaskBar
        repositoryUri="https://git.publica.re/demo/work.git"
        corsProxy={false}
        behaviour="gitlab"
        onEdit={this.setFilePath}
      >
        {this.state.filePath ? (
          <View.Editor filePath={this.state.filePath} />
        ) : (
          <div className={contentClass}>
            <DefaultButton onClick={this.openFilePicker}>
              Ouvrir un fichier
            </DefaultButton>
          </div>
        )}
        <Dialog.FilePicker
          isVisible={this.state.filePickerOpen}
          onChoose={this.setFilePath}
          onAbort={this.closeFilePicker}
        />
      </TaskBar>
    );
  }
}

const contentClass = mergeStyles([
  {
    width: "100vw",
    height: "calc(100vh - 4em)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
]);

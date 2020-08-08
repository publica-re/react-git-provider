import React from "react";
import bind from "bind-decorator";
import "./i18n";
import { View, Dialog, TaskBar } from "./Components";

import { DefaultButton } from "@fluentui/react";

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
        behaviour="gitlab"
        onEdit={this.setFilePath}
      >
        {this.state.filePath ? (
          <View.Editor filePath={this.state.filePath} />
        ) : (
          <DefaultButton onClick={this.openFilePicker}>
            Ouvrir un fichier
          </DefaultButton>
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

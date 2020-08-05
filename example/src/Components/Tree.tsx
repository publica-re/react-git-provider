import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation } from "react-i18next";

import Git, { GitCommands, GitValues, GitBakers } from "react-git-provider";

import { dataToTree } from "./_utils";
import TreeViewHelper from "./TreeViewHelper";

export interface TreeProps {
  onEdit: (path: string) => void;
}

export interface TreeState {}

class Tree extends React.Component<TreeProps & WithTranslation, TreeState> {
  static contextType = Git.Context;

  async componentDidMount() {
    const { directoryRead, directoryStatus } = this.context.bakers as GitBakers;
    await directoryRead({ path: "/" });
    await directoryStatus({});
  }

  @bind
  private async onStageFile(path: string) {
    const { fileStage, fileUnstage } = this.context.commands as GitCommands;
    const { fileStatusTree } = this.context.values as GitValues;

    if (fileStatusTree[path].status?.staged) {
      fileUnstage({ path });
    } else {
      fileStage({ path });
    }
  }

  @bind
  private async onDiscard(path: string) {
    const { fileDiscardChanges } = this.context.commands as GitCommands;
    fileDiscardChanges({ path });
  }

  @bind
  private async onDeleteFile(path: string) {
    const { fileRemove } = this.context.commands as GitCommands;
    fileRemove({ path });
  }

  render() {
    const { fileStatusTree, fileTree } = this.context.values as GitValues;
    return (
      <TreeViewHelper
        data={dataToTree(fileStatusTree, fileTree)}
        onStageFile={this.onStageFile}
        onStageDirectory={() => null}
        onNewFile={() => null}
        onNewDirectory={() => null}
        onMoveFile={() => null}
        onMoveDirectory={() => null}
        onDownloadFile={() => null}
        onDownloadDirectory={() => null}
        onDeleteFile={this.onDeleteFile}
        onDeleteDirectory={() => null}
        onRenameFile={() => null}
        onRenameDirectory={() => null}
        onUploadFile={() => null}
        onDiscard={this.onDiscard}
        onEdit={this.props.onEdit}
      />
    );
  }
}

export default React.memo(withTranslation("translation")(Tree));

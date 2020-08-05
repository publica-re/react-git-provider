import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation } from "react-i18next";

import Git, { GitCommands, GitValues } from "react-git-provider";

import { changeTree } from "./_utils";
import TreeViewHelper from "./TreeViewHelper";

export interface ChangesProps {}

export interface ChangesState {
  files: { [path: string]: FileList };
}

class Changes extends React.Component<
  ChangesProps & WithTranslation,
  ChangesState
> {
  static contextType = Git.Context;

  constructor(props: ChangesProps & WithTranslation) {
    super(props);

    this.state = {
      files: {},
    };
  }

  @bind
  async onStage(path: string) {
    const { fileStage, fileUnstage } = this.context.commands as GitCommands;
    const { fileStatusTree } = this.context.values as GitValues;

    if (fileStatusTree[path].status?.staged) {
      fileUnstage({ path });
    } else {
      fileStage({ path });
    }
  }

  render() {
    const { fileStatusTree, fileTree } = this.context.values as GitValues;
    const changeTreeData = changeTree(fileStatusTree, fileTree);
    const nullActions = {
      onStageFile: this.onStage,
      onStageDirectory: () => null,
      onNewFile: () => null,
      onNewDirectory: () => null,
      onMoveFile: () => null,
      onMoveDirectory: () => null,
      onDownloadFile: () => null,
      onDownloadDirectory: () => null,
      onDeleteFile: () => null,
      onDeleteDirectory: () => null,
      onRenameFile: () => null,
      onRenameDirectory: () => null,
      onUploadFile: () => null,
      onDiscard: () => null,
      onEdit: () => null,
    };
    return (
      <React.Fragment>
        <TreeViewHelper
          {...nullActions}
          data={changeTreeData.staged}
          contextMenu={false}
        />
        <TreeViewHelper
          data={changeTreeData.notStaged}
          {...nullActions}
          contextMenu={false}
        />
      </React.Fragment>
    );
  }
}

export default withTranslation("translation")(Changes);

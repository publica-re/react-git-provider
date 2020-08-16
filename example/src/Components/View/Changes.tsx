import * as React from "react";
import * as Intl from "react-i18next";
import bind from "bind-decorator";

import Git from "react-git-provider";

import "../../theme";

import { Utils } from "..";

export interface ChangesProps {}

export interface ChangesState {
  files: { [path: string]: FileList };
}

class Changes extends Git.Component<
  ChangesProps & Intl.WithTranslation,
  ChangesState
> {
  constructor(props: ChangesProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      files: {},
      gitWatch: {
        directory: {
          read: { path: "/" },
          status: {},
        },
      },
    };
  }

  @bind
  async onStage(path: string) {
    const { file } = this.context.io;
    const fileStatus = await file.status({ path });
    if (fileStatus.type === "success" && fileStatus.value.status?.staged) {
      await file.unstage({ path });
    } else {
      await file.stage({ path });
    }
  }

  render() {
    const { directory } = this.state.gitValues;
    if (directory?.status === undefined || directory?.read === undefined)
      return null;
    const changeTreeData = Utils.functions.changeTree(
      directory.status,
      directory.read
    );
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
      onDropFile: () => null,
      onDiscard: () => null,
      onEdit: () => null,
    };
    return (
      <React.Fragment>
        <Utils.TreeRender
          {...nullActions}
          data={changeTreeData.staged}
          contextMenu={false}
        />
        <Utils.TreeRender
          data={changeTreeData.notStaged}
          {...nullActions}
          contextMenu={false}
        />
      </React.Fragment>
    );
  }
}

export default Intl.withTranslation("translation")(Changes);

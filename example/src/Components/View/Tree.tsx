import * as React from "react";
import bind from "bind-decorator";
import pathUtils from "path";
import { generate as generateId } from "shortid";
import mime from "mime";
import JSZip from "jszip";
import "../../theme";

import { withTranslation, WithTranslation } from "react-i18next";

import Git, {
  GitCommands,
  GitValues,
  GitBakers,
  DirectoryList,
  FileStatus,
  GitStatusOption,
} from "react-git-provider";

import { Utils } from "..";

export interface TreeProps {
  pickFile: (type: "file" | "dir") => Promise<string | false>;
  prompt: (title: string, defaultValue: string) => Promise<string | false>;
  alert: (title: string) => Promise<boolean>;
  onEdit: (path: string) => void;
}

export interface TreeState {
  fileUploadDirectory?: string;
}

class Tree extends React.Component<TreeProps & WithTranslation, TreeState> {
  static contextType = Git.Context;

  private fileOpenRef = React.createRef<HTMLInputElement>();

  constructor(props: TreeProps & WithTranslation) {
    super(props);
    this.state = {
      fileUploadDirectory: undefined,
    };
  }

  async componentDidMount() {
    const { directoryRead, directoryStatus } = this.context.bakers as GitBakers;
    await directoryRead({ path: "/" });
    await directoryStatus({});
  }

  @bind
  private async onStageFile(path: string) {
    const { fileStage, fileUnstage } = this.context.commands as GitCommands;
    const { fileStatusTree } = this.context.values as GitValues;

    if (fileStatusTree[path]?.status?.staged) {
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

  @bind
  private async onDeleteDirectory(path: string) {
    const { directoryRemove } = this.context.commands as GitCommands;
    directoryRemove({ path });
  }

  @bind
  private async onUploadFile(path: string) {
    this.setState({ fileUploadDirectory: path });
    this.fileOpenRef.current?.click();
  }

  @bind
  private async onNewFile(path: string) {
    const { t } = this.props;
    const { pathExists } = this.context.bakers as GitBakers;
    const { fileWrite } = this.context.commands as GitCommands;
    const fileName = await this.props.prompt(
      t("action.file.new-name"),
      "unknown"
    );
    if (fileName !== false) {
      const targetPath = pathUtils.join(path, fileName);
      if (!(await pathExists({ path: targetPath }))) {
        await fileWrite({ path: targetPath, content: "", mode: "text" });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async onNewFolder(path: string) {
    const { t } = this.props;
    const { pathExists } = this.context.bakers as GitBakers;
    const { directoryMake } = this.context.commands as GitCommands;
    const fileName = await this.props.prompt(
      t("action.directory.new-name"),
      "unknown"
    );
    if (fileName !== false) {
      const targetPath = pathUtils.join(path, fileName);
      if (!(await pathExists({ path: targetPath }))) {
        await directoryMake({ path: targetPath });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async onRename(oldPath: string) {
    const { t } = this.props;
    const { pathExists } = this.context.bakers as GitBakers;
    const { fileMove } = this.context.commands as GitCommands;
    const fileName = await this.props.prompt(
      t("action.file.new-name"),
      pathUtils.basename(oldPath)
    );
    if (fileName !== false) {
      const dirName = pathUtils.dirname(oldPath);
      const newPath = pathUtils.join(dirName, fileName);
      if (!(await pathExists({ path: newPath }))) {
        await fileMove({ from: oldPath, to: newPath });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async onMove(oldPath: string) {
    const { t } = this.props;
    const { pathExists } = this.context.bakers as GitBakers;
    const { fileMove } = this.context.commands as GitCommands;
    const newDir = await this.props.pickFile("dir");
    if (newDir !== false) {
      const baseName = pathUtils.basename(oldPath);
      const newPath = pathUtils.join(newDir, baseName);
      if (!(await pathExists({ path: newPath }))) {
        await fileMove({ from: oldPath, to: newPath });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async handleUploadFile(event: React.FormEvent<HTMLInputElement>) {
    const { pathExists } = this.context.bakers as GitBakers;
    const { fileWrite } = this.context.commands as GitCommands;
    const files = (event.target as any).files as FileList;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let path = file.name;
      const targetPath = pathUtils.join(
        this.state.fileUploadDirectory || "/",
        path
      );
      const exists = await pathExists({ path: targetPath });
      if (exists) {
        path = `${generateId()}${pathUtils.extname(path)}`;
      }
      const data = await Utils.functions.readFileAsync(file);
      await fileWrite({
        path: targetPath,
        content: data,
        mode: "binary",
      });
    }
  }

  @bind
  private downloadData(fileName: string, data: any) {
    const contentMime = mime.getType(fileName);
    const blob = new Blob([data], { type: contentMime || undefined });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  @bind
  private async onDownloadFile(path: string) {
    const { fileRead } = this.context.bakers as GitBakers;
    const content = (await fileRead(
      { path: path, mode: "binary" },
      false
    )) as Uint8Array;
    this.downloadData(pathUtils.basename(path), content);
  }

  @bind
  private async onDownloadDirectory(path: string) {
    const { fileRead, directoryRead } = this.context.bakers as GitBakers;
    const zip = new JSZip();
    console.log("start zip");

    async function walkDir(oldFolder: any, dir: DirectoryList) {
      const name = pathUtils.basename(dir.path);
      const newFolder = oldFolder.folder(name);
      for (const child of dir.children) {
        if (child.type === "file") {
          const fileName = pathUtils.basename(child.path);
          newFolder.file(
            fileName,
            await fileRead({ path: child.path, mode: "binary" }),
            false
          );
        } else {
          await walkDir(newFolder, child);
        }
      }
    }
    const data = await directoryRead({ path: path }, false);
    if (data.type === "file") {
      return this.onDownloadFile(path);
    }
    await walkDir(zip, data);
    const outZip = await zip.generateAsync({ type: "blob" });
    const outName = `${pathUtils.basename(path)}.zip`;
    console.log(outZip);

    this.downloadData(outName, outZip);
  }

  @bind
  private async onStageDirectory(path: string) {
    const { fileStage, fileUnstage } = this.context.commands as GitCommands;
    const { directoryStatus } = this.context.bakers as GitBakers;
    const dirStatus = (await directoryStatus({}, false)) as {
      [path: string]: FileStatus;
    };
    const statusList: [string, boolean | undefined][] = Object.entries(
      dirStatus
    )
      .filter(
        ([filePath, entry]: [string, FileStatus]) =>
          pathUtils.dirname(filePath).startsWith(path) &&
          entry.status?.option !== GitStatusOption.UnModified
      )
      .map(([filePath, entry]) => [filePath, entry.status?.staged]);
    const staged = statusList
      .filter(([_, isStaged]) => isStaged)
      .map(([filePath, _]) => filePath);
    const unstaged = statusList
      .filter(([_, isStaged]) => !isStaged)
      .map(([filePath, _]) => filePath);
    if (unstaged.length === 0) {
      for (const file of staged) {
        await fileUnstage({ path: file });
      }
    } else {
      for (const file of unstaged) {
        await fileStage({ path: file });
      }
    }
  }

  @bind
  private async onDropFile(directoryPath: string) {
    console.log("drop");

    const { pathExists } = this.context.bakers as GitBakers;
    const { fileWrite } = this.context.commands as GitCommands;
    const files = (window.event as any).dataTransfer.files as FileList;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let path = file.name;
      const targetPath = pathUtils.join(directoryPath || "/", path);
      const exists = await pathExists({ path: targetPath });
      if (exists) {
        path = `${generateId()}${pathUtils.extname(path)}`;
      }
      const data = await Utils.functions.readFileAsync(file);
      await fileWrite({
        path: targetPath,
        content: data,
        mode: "binary",
      });
    }
  }

  render() {
    const { fileStatusTree, fileTree } = this.context.values as GitValues;
    return (
      <React.Fragment>
        <Utils.TreeRender
          data={Utils.functions.dataToTree(fileStatusTree, fileTree)}
          onStageFile={this.onStageFile}
          onStageDirectory={this.onStageDirectory}
          onNewFile={this.onNewFile}
          onNewDirectory={this.onNewFolder}
          onMoveFile={this.onMove}
          onMoveDirectory={this.onMove}
          onDownloadFile={this.onDownloadFile}
          onDownloadDirectory={this.onDownloadDirectory}
          onDeleteFile={this.onDeleteFile}
          onDeleteDirectory={this.onDeleteDirectory}
          onRenameFile={this.onRename}
          onRenameDirectory={this.onRename}
          onUploadFile={this.onUploadFile}
          onDropFile={this.onDropFile}
          onDiscard={this.onDiscard}
          onEdit={this.props.onEdit}
        />
        <input
          type="file"
          ref={this.fileOpenRef}
          style={{ display: "none" }}
          onChange={this.handleUploadFile}
        />
      </React.Fragment>
    );
  }
}

export default React.memo(withTranslation("translation")(Tree));

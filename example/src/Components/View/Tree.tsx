import * as React from "react";
import * as Intl from "react-i18next";
import bind from "bind-decorator";
import pathUtils from "path";
import { generate as generateId } from "shortid";
import mime from "mime";
import JSZip from "jszip";

import Git, { GitStatusOption, DirectoryList } from "react-git-provider";

import "../../theme";

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

class Tree extends Git.Component<TreeProps & Intl.WithTranslation, TreeState> {
  // for file upload
  private fileOpenRef = React.createRef<HTMLInputElement>();

  constructor(props: TreeProps & Intl.WithTranslation) {
    super(props);
    this.state = {
      ...this.state,
      fileUploadDirectory: undefined,
      gitWatch: {
        directory: {
          read: { path: "/" },
          status: {},
        },
      },
    };
  }

  @bind
  private async onStageFile(path: string) {
    const { file } = this.context.io;
    const fileStatus = await file.status({ path });
    if (fileStatus.type === "success" && fileStatus.value.status?.staged) {
      await file.unstage({ path });
    } else {
      await file.stage({ path });
    }
  }

  @bind
  private async onDiscard(path: string) {
    const { file } = this.context.io;
    await file.discardChanges({ path });
  }

  @bind
  private async onDeleteFile(path: string) {
    const { file } = this.context.io;
    await file.remove({ path });
  }

  @bind
  private async onDeleteDirectory(path: string) {
    const { directory } = this.context.io;
    await directory.remove({ path });
  }

  @bind
  private async onUploadFile(path: string) {
    this.setState({ fileUploadDirectory: path });
    this.fileOpenRef.current?.click();
  }

  @bind
  private async onNewFile(path: string) {
    const { file } = this.context.io;
    const { t } = this.props;
    const fileName = await this.props.prompt(
      t("action.file.new-name"),
      "unknown"
    );
    if (fileName !== false) {
      const targetPath = pathUtils.join(path, fileName);
      const fileExists = await file.exists({ path: targetPath });
      if (fileExists.type === "success" && fileExists.value === false) {
        await file.write({ path: targetPath, content: "", mode: "text" });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async onNewFolder(path: string) {
    const { file, directory } = this.context.io;
    const { t } = this.props;
    const fileName = await this.props.prompt(
      t("action.directory.new-name"),
      "unknown"
    );
    if (fileName !== false) {
      const targetPath = pathUtils.join(path, fileName);
      const fileExists = await file.exists({ path: targetPath });
      if (fileExists.type === "success" && fileExists.value === false) {
        await directory.make({ path: targetPath });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async onRename(oldPath: string) {
    const { file } = this.context.io;
    const { t } = this.props;
    const fileName = await this.props.prompt(
      t("action.file.new-name"),
      pathUtils.basename(oldPath)
    );
    if (fileName !== false) {
      const dirName = pathUtils.dirname(oldPath);
      const newPath = pathUtils.join(dirName, fileName);
      const fileExists = await file.exists({ path: newPath });
      if (fileExists.type === "success" && fileExists.value === false) {
        await file.move({ from: oldPath, to: newPath });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async onMove(oldPath: string) {
    const { file } = this.context.io;
    const { t } = this.props;
    const newDir = await this.props.pickFile("dir");
    if (newDir !== false) {
      const baseName = pathUtils.basename(oldPath);
      const newPath = pathUtils.join(newDir, baseName);
      const fileExists = await file.exists({ path: newPath });
      if (fileExists.type === "success" && fileExists.value === false) {
        await file.move({ from: oldPath, to: newPath });
      } else {
        this.props.alert(t("error.file.already-exists"));
      }
    }
  }

  @bind
  private async handleUploadFile(event: React.FormEvent<HTMLInputElement>) {
    const { file } = this.context.io;
    const files = (event.target as any).files as FileList;
    for (let i = 0; i < files.length; i++) {
      const targetObject = files[i];
      let path = targetObject.name;
      const targetPath = pathUtils.join(
        this.state.fileUploadDirectory || "/",
        path
      );
      const fileExists = await file.exists({ path: targetPath });
      if (fileExists.type === "success" && fileExists.value === true) {
        path = `${generateId()}${pathUtils.extname(path)}`;
      }
      const data = await Utils.functions.readFileAsync(targetObject);
      await file.write({
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
    const { file } = this.context.io;
    const content = await file.read({
      path: path,
      mode: "binary",
    });
    this.downloadData(pathUtils.basename(path), content);
  }

  @bind
  private async onDownloadDirectory(path: string) {
    const { file, directory } = this.context.io;
    const zip = new JSZip();
    console.log("start zip");

    async function walkDir(oldFolder: any, dir: DirectoryList) {
      const name = pathUtils.basename(dir.path);
      const newFolder = oldFolder.folder(name);
      for (const child of dir.children) {
        if (child.type === "file") {
          const fileName = pathUtils.basename(child.path);
          const fileData = await file.read({
            path: child.path,
            mode: "binary",
          });
          if (fileData.type === "success") {
            newFolder.file(fileName, fileData.value, false);
          }
        } else {
          await walkDir(newFolder, child);
        }
      }
    }
    const data = await directory.read({ path: path });
    if (data.type === "success") {
      if (data.value.type === "file") {
        return this.onDownloadFile(path);
      }
      await walkDir(zip, data.value);
      const outZip = await zip.generateAsync({ type: "blob" });
      const outName = `${pathUtils.basename(path)}.zip`;
      this.downloadData(outName, outZip);
    }
  }

  @bind
  private async onStageDirectory(path: string) {
    const { file, directory } = this.context.io;
    const dirStatus = await directory.status({});
    if (dirStatus.type === "success") {
      const statusList = Object.entries(dirStatus.value).reduce(
        (prev, [filePath, entry]) => {
          if (
            pathUtils.dirname(filePath).startsWith(path) &&
            entry.status?.option !== GitStatusOption.UnModified &&
            entry.status?.staged !== undefined
          ) {
            return [...prev, [filePath, entry.status?.staged]] as [
              string,
              boolean
            ][];
          }
          return prev;
        },
        [] as [string, boolean][]
      );
      const staged = statusList.reduce((prev, cur) => {
        if (cur[1]) return [...prev, cur[0]];
        return prev;
      }, [] as string[]);
      const unstaged = statusList.reduce((prev, cur) => {
        if (!cur[1]) return [...prev, cur[0]];
        return prev;
      }, [] as string[]);
      if (unstaged.length === 0) {
        for (const object of staged) {
          await file.unstage({ path: object });
        }
      } else {
        for (const object of unstaged) {
          await file.stage({ path: object });
        }
      }
    }
  }

  @bind
  private async onDropFile(directoryPath: string) {
    const { file } = this.context.io;
    const files = (window.event as any).dataTransfer.files as FileList;
    for (let i = 0; i < files.length; i++) {
      const targetObject = files[i];
      let path = targetObject.name;
      const targetPath = pathUtils.join(directoryPath || "/", path);
      const fileExists = await file.exists({ path: targetPath });
      if (fileExists.type === "success" && fileExists.value === true) {
        path = `${generateId()}${pathUtils.extname(path)}`;
      }
      const data = await Utils.functions.readFileAsync(targetObject);
      await file.write({
        path: targetPath,
        content: data,
        mode: "binary",
      });
    }
  }

  render() {
    const { directory } = this.state.gitValues;
    if (directory?.read === undefined || directory?.status === undefined)
      return null;
    return (
      <React.Fragment>
        <Utils.TreeRender
          data={Utils.functions.dataToTree(directory?.status, directory?.read)}
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

export default Intl.withTranslation("translation")(Tree);

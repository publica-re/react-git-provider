import {
  GitStatus,
  GitStatusOption,
  FileStatus,
  DirectoryList,
  FileList,
} from "react-git-provider";
import pathUtils from "path";

import i18n from "../i18n";

const t = i18n.t.bind(i18n);

export function dataToTree(
  statusTree: { [path: string]: FileStatus },
  tree: DirectoryList | FileList
) {
  function getAllFiles(dir: DirectoryList): string[] {
    let out: string[] = [];
    for (let child of dir.children) {
      if (child.type === "file") {
        out.push(child.path);
      } else {
        out = [...out, ...getAllFiles(child)];
      }
    }
    return out;
  }
  const treeFiles = tree.type === "directory" ? getAllFiles(tree) : [];
  const statusTreeFiles = Object.keys(statusTree);
  const joinedFiles = new Set([...treeFiles, ...statusTreeFiles]);
  const dirs = new Set();
  const outputDirs: any = [];
  for (const file of joinedFiles) {
    file.split("/").reduce((prev, cur) => {
      dirs.add(prev);
      return pathUtils.join(prev, cur);
    }, "/");
  }
  for (const dir of dirs) {
    outputDirs.push({
      id: dir as string,
      name: pathUtils.basename(dir as string) || dir,
      children: [...joinedFiles]
        .filter((f) => pathUtils.dirname(f) === dir)
        .map((f) => ({
          id: f,
          name: pathUtils.basename(f),
          details: statusTree[f],
        })),
    });
  }
  for (const dir of outputDirs) {
    const parent = pathUtils.dirname(dir.id);
    if (parent !== dir.id)
      outputDirs
        .find(({ id }: { id: string }) => id === parent)
        ?.children.push(dir);
  }
  const final = outputDirs.filter(({ id }: { id: string }) => id === "/");
  return final[0];
}

export function changeTree(
  statusTree: { [path: string]: FileStatus },
  tree: DirectoryList | FileList
) {
  function getAllFiles(dir: DirectoryList): string[] {
    let out: string[] = [];
    for (let child of dir.children) {
      if (child.type === "file") {
        out.push(child.path);
      } else {
        out = [...out, ...getAllFiles(child)];
      }
    }
    return out;
  }
  const treeFiles = tree.type === "directory" ? getAllFiles(tree) : [];
  const statusTreeFiles = Object.keys(statusTree);
  const joinedFiles = new Set([...treeFiles, ...statusTreeFiles]);
  const staged = [];
  const notStaged = [];
  for (const file of joinedFiles) {
    if (statusTree[file] !== undefined) {
      if (statusTree[file].status?.option !== GitStatusOption.UnModified) {
        if (statusTree[file].status?.staged) {
          staged.push({
            id: file,
            name: pathUtils.basename(file),
            details: statusTree[file],
          });
        } else {
          notStaged.push({
            id: file,
            name: pathUtils.basename(file),
            details: statusTree[file],
          });
        }
      }
    } else {
      notStaged.push({ id: file, name: pathUtils.basename(file) });
    }
  }
  return {
    staged: {
      id: "staged",
      name: t("status.staged"),
      children: staged,
    },
    notStaged: {
      id: "not-staged",
      name: t("status.not-staged"),
      children: notStaged,
    },
  };
}

export function gitStatusToIcon(status: GitStatus) {
  switch (status.option) {
    case GitStatusOption.Ignored:
      return { iconName: "Hide3", title: t("status.ignored") };
    case GitStatusOption.UnModified:
      return {
        iconName: "Uneditable2",
        title: t("status.not-changed"),
      };
    case GitStatusOption.Modified:
      return { iconName: "Edit", title: t("status.changed") };
    case GitStatusOption.UnDeleted:
      return {
        iconName: "ClearSelection",
        title: t("status.restored"),
      };
    case GitStatusOption.Deleted:
      return { iconName: "PageRemove", title: t("status.deleted") };
    case GitStatusOption.Added:
      return { iconName: "PageAdd", title: t("status.added") };
    case GitStatusOption.Absent:
      return { iconName: "SurveyQuestion", title: t("status.absent") };
    case GitStatusOption.UnDeletedModified:
      return { iconName: "Edit", title: t("status.restored-modified") };
  }
}

export function gitStagedToIcon(status: GitStatus) {
  if (status.staged)
    return { iconName: "RadioBtnOn", title: t("status.staged") };
  else {
    if (status.option === GitStatusOption.UnModified) {
      return {
        iconName: "RadioBtnOff",
        title: t("status.not-staged"),
      };
    } else {
      return {
        iconName: "WarningSolid",
        title: t("status.modified-not-staged"),
      };
    }
  }
}

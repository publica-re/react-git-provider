import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation } from "react-i18next";
import {
  Stack,
  IconButton,
  mergeStyles,
  getTheme,
  CommandBarButton,
  ButtonType,
} from "@fluentui/react";

import { GitStatusOption } from "react-git-provider";

import { gitStagedToIcon, gitStatusToIcon } from "./_utils";

type TreeViewData = {
  id: string;
  name: string;
  children?: TreeViewData[];
  details?: any;
};

export interface TreeViewHelperProps {
  data: TreeViewData;
  onStageFile: (path: string) => void;
  onStageDirectory: (path: string) => void;
  onNewFile: (path: string) => void;
  onNewDirectory: (path: string) => void;
  onMoveFile: (path: string) => void;
  onMoveDirectory: (path: string) => void;
  onDownloadFile: (path: string) => void;
  onDownloadDirectory: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onDeleteDirectory: (path: string) => void;
  onRenameFile: (path: string) => void;
  onRenameDirectory: (path: string) => void;
  onUploadFile: (path: string) => void;
  onDiscard: (path: string) => void;
  onEdit: (path: string) => void;
  contextMenu?: boolean;
}

export interface TreeViewHelperState {
  isOpen: boolean;
}

class TreeViewHelper extends React.Component<
  TreeViewHelperProps & WithTranslation,
  TreeViewHelperState
> {
  constructor(props: TreeViewHelperProps & WithTranslation) {
    super(props);

    this.state = {
      isOpen: true,
    };
  }

  @bind
  private renderDirContextMenu() {
    const { t } = this.props;
    const { id } = this.props.data;
    const childrenAllStaged = !this.props.data.children?.find(
      (f) => !f.details?.status?.staged
    );
    const { isOpen } = this.state;
    return [
      {
        key: "new",
        text: t("action.new"),
        iconProps: {
          iconName: "BoxAdditionSolid",
        },
        subMenuProps: {
          items: [
            {
              key: "new-file",
              text: t("action.file.new"),
              iconProps: {
                iconName: "PageAdd",
              },
              onClick: () => this.props.onNewFile(id),
            },
            {
              key: "new-folder",
              text: t("action.directory.new"),
              iconProps: {
                iconName: "FabricNewFolder",
              },
              onClick: () => this.props.onNewDirectory(id),
            },
            {
              key: "upload",
              text: t("action.file.upload"),
              iconProps: {
                iconName: "Upload",
              },
              onClick: () => this.props.onUploadFile(id),
            },
          ],
        },
      },
      {
        key: "props",
        text: t("action.properties"),
        iconProps: { iconName: "SetAction" },
        subMenuProps: {
          items: [
            {
              key: "rename",
              text: t("action.file.rename"),
              iconProps: {
                iconName: "Rename",
              },
              onClick: () => this.props.onRenameDirectory(id),
            },
            {
              key: "move",
              text: t("action.file.move"),
              iconProps: {
                iconName: "FabricMovetoFolder",
              },
              onClick: () => this.props.onMoveDirectory(id),
            },
            {
              key: "download",
              text: t("action.directory.download"),
              iconProps: {
                iconName: "Download",
              },
              onClick: () => this.props.onDownloadDirectory(id),
            },
            {
              key: "delete",
              text: t("action.file.delete"),
              iconProps: {
                iconName: "Delete",
              },
              onClick: () => this.props.onDeleteDirectory(id),
            },
          ],
        },
      },

      {
        key: "stage",
        text: childrenAllStaged
          ? t("action.directory.unstage")
          : t("action.directory.stage"),
        iconProps: {
          iconName: childrenAllStaged
            ? "ArrangeSendToBack"
            : "ArrangeBringToFront",
        },
        onClick: () => this.props.onStageDirectory(id),
      },

      {
        key: "close",
        text: isOpen
          ? t("action.directory.collapse")
          : t("action.directory.expand"),
        iconProps: {
          iconName: isOpen ? "ClosePane" : "OpenPane",
        },
        onClick: () =>
          this.setState(({ isOpen }) => ({
            isOpen: !isOpen,
          })),
      },
    ];
  }

  @bind
  private renderFileContextMenu() {
    const { t } = this.props;
    const { details, id } = this.props.data;
    const isDeleted = details?.status?.option === GitStatusOption.Deleted;
    const isModified = details?.status?.option !== GitStatusOption.UnModified;
    const isStaged = !!details?.status?.staged;
    return [
      ...(!isDeleted
        ? [
            {
              key: "edit",
              text: t("action.file.edit"),
              iconProps: {
                iconName: "Edit",
              },
              onClick: () => this.props.onEdit(id),
            },
          ]
        : []),
      {
        key: "props",
        text: t("action.properties"),
        iconProps: { iconName: "SetAction" },
        subMenuProps: {
          items: [
            {
              key: "rename",
              text: t("action.file.rename"),
              iconProps: {
                iconName: "Rename",
              },
              onClick: () => this.props.onRenameFile(id),
            },
            {
              key: "move",
              text: t("action.file.move"),
              iconProps: {
                iconName: "FabricMovetoFolder",
              },
              onClick: () => this.props.onMoveFile(id),
            },
            {
              key: "download",
              text: t("action.file.download"),
              iconProps: {
                iconName: "Download",
              },
              onClick: () => this.props.onDownloadFile(id),
            },
            {
              key: "delete",
              text: t("action.file.delete"),
              iconProps: {
                iconName: "Delete",
              },
              onClick: () => this.props.onDeleteFile(id),
            },
          ],
        },
      },
      ...(isModified
        ? [
            {
              key: "discardChanges",
              text: t("action.file.discard-changes"),
              iconProps: {
                iconName: "DrillThrough",
              },
              onClick: () => this.props.onDiscard(id),
            },
          ]
        : []),
      {
        key: "stage",
        text: isStaged ? t("action.file.unstage") : t("action.file.stage"),
        iconProps: {
          iconName: isStaged ? "ArrangeSendToBack" : "ArrangeBringToFront",
        },
        onClick: () => this.props.onStageFile(id),
      },
    ];
  }

  render() {
    const { name, details, children } = this.props.data;
    const isDir = children !== undefined;
    if (isDir) {
      const { isOpen } = this.state;
      return (
        <Stack className={contentClass}>
          <Stack horizontal>
            <CommandBarButton
              iconProps={{
                iconName: isOpen ? "ChevronDown" : "ChevronUp",
              }}
              onDoubleClick={() =>
                this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
              }
              className={titleClass}
              menuProps={
                (this.props.contextMenu !== false && {
                  items: this.renderDirContextMenu(),
                }) ||
                undefined
              }
            >
              {name}
            </CommandBarButton>
          </Stack>
          {isOpen &&
            (children as TreeViewData[]).map((child) => (
              <TranslatedTreeViewHelper
                {...this.props}
                data={child}
                key={child.id}
              />
            ))}
        </Stack>
      );
    } else {
      const { onEdit } = this.props;
      const { id } = this.props.data;
      const stageIcon = details?.status && gitStagedToIcon(details?.status);
      const statusIcon = details?.status && gitStatusToIcon(details?.status);
      const isDeleted = details?.status?.option === GitStatusOption.Deleted;
      const isAdded = details?.status?.option === GitStatusOption.Added;
      return (
        <Stack className={contentClassItem}>
          <Stack horizontal>
            <CommandBarButton
              iconProps={{
                iconName: "TextDocument",
              }}
              className={titleClass}
              onDoubleClick={() => onEdit(id)}
              menuProps={
                (this.props.contextMenu !== false && {
                  items: this.renderFileContextMenu(),
                }) ||
                undefined
              }
              style={{
                textDecoration: isDeleted ? "line-through" : "",
                fontStyle: isAdded ? "italic" : "",
              }}
            >
              {name}
            </CommandBarButton>
            {stageIcon && (
              <IconButton
                onClick={() => this.props.onStageFile(id)}
                iconProps={{ iconName: stageIcon.iconName }}
                title={stageIcon.title}
                color={theme.palette.white}
              />
            )}
            {statusIcon && (
              <IconButton
                buttonType={ButtonType.primary}
                theme={theme}
                iconProps={{ iconName: statusIcon.iconName }}
                title={statusIcon.title}
                color={theme.palette.white}
              />
            )}
          </Stack>
        </Stack>
      );
    }
  }
}

const TranslatedTreeViewHelper = withTranslation("translation")(TreeViewHelper);

export default TranslatedTreeViewHelper;

const theme = getTheme();
const contentClass = mergeStyles([
  {
    padding: "1em 0 0 1em",
  },
]);
const contentClassItem = mergeStyles([
  {
    padding: "0em",
  },
]);

const titleClass = mergeStyles([
  {
    textAlign: "left",
    width: "100%",
  },
]);

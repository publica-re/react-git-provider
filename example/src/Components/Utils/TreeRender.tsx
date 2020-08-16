import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";

import { GitStatusOption } from "react-git-provider";
import "../../theme";

import { Utils } from "..";

type TreeViewData = {
  id: string;
  name: string;
  children?: TreeViewData[];
  details?: any;
};

export interface TreeRenderProps {
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
  onDropFile: (path: string) => void;
  onDiscard: (path: string) => void;
  onEdit: (path: string) => void;
  contextMenu?: boolean;
}

export interface TreeRenderState {
  isOpen: boolean;
}

class TreeRender extends React.Component<
  TreeRenderProps & Intl.WithTranslation,
  TreeRenderState
> {
  constructor(props: TreeRenderProps & Intl.WithTranslation) {
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
            ...(id !== "/"
              ? [
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
                ]
              : []),
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
          ]
        : []),
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
    const { name, details, children, id } = this.props.data;
    const isDir = children !== undefined;
    if (isDir) {
      const { isOpen } = this.state;
      return (
        <UI.Stack className={contentClass}>
          <div
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.persist();
              this.props.onDropFile(id);
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            className="dropZone"
          >
            <UI.Stack horizontal>
              <UI.CommandBarButton
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
              </UI.CommandBarButton>
            </UI.Stack>
            {isOpen &&
              (children as TreeViewData[]).map((child) => (
                <TranslatedTreeRender
                  {...this.props}
                  data={child}
                  key={child.id}
                />
              ))}
          </div>
        </UI.Stack>
      );
    } else {
      const { onEdit } = this.props;
      const { id } = this.props.data;
      const stageIcon =
        details?.status && Utils.functions.gitStagedToIcon(details?.status);
      const statusIcon =
        details?.status && Utils.functions.gitStatusToIcon(details?.status);
      const isDeleted = details?.status?.option === GitStatusOption.Deleted;
      const isAdded = details?.status?.option === GitStatusOption.Added;
      return (
        <UI.Stack className={contentClassItem}>
          <UI.Stack horizontal>
            <UI.CommandBarButton
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
            </UI.CommandBarButton>
            {stageIcon && (
              <UI.IconButton
                onClick={() => this.props.onStageFile(id)}
                iconProps={{ iconName: stageIcon.iconName }}
                title={stageIcon.title}
                color={theme.palette.white}
              />
            )}
            {statusIcon && (
              <UI.IconButton
                buttonType={UI.ButtonType.primary}
                theme={theme}
                iconProps={{ iconName: statusIcon.iconName }}
                title={statusIcon.title}
                color={theme.palette.white}
              />
            )}
          </UI.Stack>
        </UI.Stack>
      );
    }
  }
}

const TranslatedTreeRender = Intl.withTranslation("translation")(TreeRender);

export default TranslatedTreeRender;

const theme = UI.getTheme();
const contentClass = UI.mergeStyles([
  {
    padding: "1em 0 0 1em",
  },
]);
const contentClassItem = UI.mergeStyles([
  {
    padding: "0em",
  },
]);

const titleClass = UI.mergeStyles([
  {
    textAlign: "left",
    width: "100%",
  },
]);

import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation, Trans } from "react-i18next";
import {
  getTheme,
  mergeStyles,
  Stack,
  IconButton,
  Panel,
  Text,
  PanelType,
  Separator,
} from "@fluentui/react";

import Git, { GitBakers, GitValues, GitCommands } from "react-git-provider";

import { Changes, Tree, Log, Branch, QuickCommit, QuickMerge } from ".";

export interface ActionMenuProps {
  onEdit: (path: string) => void;
}

export interface ActionMenuState {
  changePanelOpen: boolean;
  fileTreeOpen: boolean;
  historyPanelOpen: boolean;
  modifiedKeyDown: boolean;
}

class ActionMenu extends React.Component<
  ActionMenuProps & WithTranslation,
  ActionMenuState
> {
  static contextType = Git.Context;

  constructor(props: ActionMenuProps & WithTranslation) {
    super(props);

    this.state = {
      changePanelOpen: false,
      fileTreeOpen: false,
      historyPanelOpen: false,
      modifiedKeyDown: false,
    };
  }

  @bind
  async componentDidMount() {
    const { branchList, branchCurrent } = this.context.bakers as GitBakers;
    await branchList({});
    await branchCurrent({});
    document.addEventListener("keydown", (event) =>
      this.setState({ modifiedKeyDown: event.ctrlKey })
    );
    document.addEventListener("keyup", () =>
      this.setState({ modifiedKeyDown: false })
    );
  }

  @bind
  async actionSwitchBranch(key: string) {
    const { branchList } = this.context.values as GitValues;
    const { branchCreate, branchSwitch } = this.context.commands as GitCommands;
    if (!branchList["local"].includes(key)) {
      await branchCreate({ ref: key });
    }
    await branchSwitch({ ref: key });
  }

  private CustomPanel: React.FC<{
    header: string;
    openKey: "fileTreeOpen" | "historyPanelOpen" | "changePanelOpen";
    type: PanelType;
    width?: string;
    children?: React.ReactElement;
  }> = (props) => {
    return (
      <Panel
        headerText={props.header}
        className={panel}
        isOpen={this.state[props.openKey]}
        onDismiss={() =>
          this.setState({
            ...this.state,
            [props.openKey as
              | "fileTreeOpen"
              | "historyPanelOpen"
              | "changePanelOpen"]: !this.state[props.openKey],
          })
        }
        isBlocking={false}
        customWidth={props.width || "400px"}
        type={props.type}
      >
        {props.children}
      </Panel>
    );
  };

  render() {
    const { t } = this.props;
    const { CustomPanel } = this;
    return (
      <Stack>
        <Stack horizontal className={contentClass} tokens={{ childrenGap: 15 }}>
          <IconButton
            className={iconButtonClass}
            iconProps={{
              iconName: this.state.fileTreeOpen
                ? "FolderHorizontal"
                : "FolderList",
            }}
            text={t("view.tree")}
            title={t("view.tree")}
            onClick={(_event: any) =>
              this.setState({
                fileTreeOpen: !this.state.fileTreeOpen,
              })
            }
          />
          <IconButton
            className={iconButtonClass}
            iconProps={{
              iconName: this.state.changePanelOpen
                ? "EntitlementPolicy"
                : "ChangeEntitlements",
            }}
            text={t("view.changes")}
            title={t("view.changes")}
            onClick={(_event: any) =>
              this.setState({
                changePanelOpen: !this.state.changePanelOpen,
              })
            }
          />
          <IconButton
            className={iconButtonClass}
            iconProps={{
              iconName: this.state.historyPanelOpen
                ? "RemoveOccurrence"
                : "History",
            }}
            text={t("view.history")}
            title={t("view.history")}
            onClick={(_event: any) =>
              this.setState({
                historyPanelOpen: !this.state.historyPanelOpen,
              })
            }
          />
          <Separator vertical />
          <Text>
            <Trans ns="translation" i18nKey="title.branch" />
          </Text>
          <Branch
            filter="local"
            allowNewBranch={true}
            selection={this.context.values.branchCurrent}
            onSelect={this.actionSwitchBranch}
          />
          <Separator vertical />
          <Text>
            <Trans ns="translation" i18nKey="title.merge" />
          </Text>
          <QuickMerge />
          <Separator vertical />
          <Text>
            <Trans ns="translation" i18nKey="title.commit" />
          </Text>
          <QuickCommit />
        </Stack>
        <CustomPanel
          header={t("title.changes")}
          openKey="changePanelOpen"
          type={PanelType.custom}
        >
          <Changes />
        </CustomPanel>
        <CustomPanel
          header={t("title.tree")}
          openKey="fileTreeOpen"
          type={PanelType.customNear}
        >
          <Tree onEdit={this.props.onEdit} />
        </CustomPanel>
        <CustomPanel
          header={t("title.history")}
          openKey="historyPanelOpen"
          type={PanelType.custom}
          width={"720px"}
        >
          <Log />
        </CustomPanel>
      </Stack>
    );
  }
}

export default withTranslation("translation")(ActionMenu);

const theme = getTheme();
const contentClass = mergeStyles([
  {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
    position: "absolute",
    bottom: 0,
    padding: "0 1em",
    alignItems: "center",
    height: "4em",
    width: "100vw",
  },
]);
const iconButtonClass = mergeStyles([
  {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
]);

const panel = mergeStyles([
  {
    height: "calc(100vh - 4em)",
  },
]);

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
import "../theme";
import * as API from "../API";

import Git, { GitInternal } from "react-git-provider";

import { View, Quick, Dialog } from ".";

export interface ActionMenuProps {
  onEdit: (path: string) => void;
  behaviour?: "gitlab";
}

export interface ActionMenuState {
  changePanelOpen: boolean;
  fileTreeOpen: boolean;
  historyPanelOpen: boolean;
  modifiedKeyDown: boolean;
  prompt?: {
    title: string;
    defaultValue: string;
    value?: string;
  };
  alert?: {
    title: string;
    canChoose: boolean;
    result?: boolean;
  };
  pick?: {
    type: "file" | "dir";
    path?: string;
  };
  api?: API.Abstract;
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
      prompt: undefined,
      alert: undefined,
      pick: undefined,
    };
  }

  @bind
  async componentDidMount() {
    const { getAuth, url, setAuthor } = this.context.internal as GitInternal;
    const auth = await getAuth("", {});
    if (auth.password) {
      this.setState({
        api: new API.Gitlab(auth.password, url),
      });
      const author = await this.state.api?.userInfos();
      if (author !== undefined) {
        setAuthor(author);
      }
    }
    document.addEventListener("keydown", (event) =>
      this.setState({ modifiedKeyDown: event.ctrlKey })
    );
    document.addEventListener("keyup", () =>
      this.setState({ modifiedKeyDown: false })
    );
  }

  @bind
  async doPrompt(title: string, defaultValue: string): Promise<string | false> {
    this.setState({
      prompt: { title, defaultValue, value: undefined },
    });
    while (true) {
      if (this.state.prompt !== undefined) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    while (true) {
      if (this.state.prompt === undefined) break;
      if (this.state.prompt.value !== undefined) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (this.state.prompt?.value !== undefined) {
      const value = this.state.prompt?.value;
      this.setState({ prompt: undefined });
      return value;
    } else {
      this.setState(() => ({
        prompt: undefined,
      }));
      return false;
    }
  }

  @bind
  handlePromptChange(value: string) {
    if (this.state.prompt !== undefined) {
      this.setState({
        prompt: {
          ...this.state.prompt,
          value: value,
        },
      });
    }
  }

  @bind
  handlePromptAbort() {
    this.setState(() => ({
      prompt: undefined,
    }));
  }

  @bind
  async doAlert(title: string, canChoose: boolean = false): Promise<boolean> {
    this.setState({
      alert: { title, canChoose },
    });
    while (true) {
      if (this.state.alert !== undefined) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    while (true) {
      if (this.state.alert.result !== undefined) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (this.state.alert?.result !== undefined) {
      const value = this.state.alert?.result;
      this.setState({ alert: undefined });
      return value;
    } else {
      this.setState(() => ({
        alert: undefined,
      }));
      return false;
    }
  }

  @bind
  handleAlertClose() {
    if (this.state.alert !== undefined) {
      this.setState({
        alert: {
          ...this.state.alert,
          result: this.state.alert.canChoose ? false : true,
        },
      });
    }
  }

  @bind
  handleAlertConfirm() {
    if (this.state.alert !== undefined) {
      this.setState({
        alert: {
          ...this.state.alert,
          result: true,
        },
      });
    }
  }

  @bind
  async doPick(type: "file" | "dir"): Promise<string | false> {
    this.setState({
      pick: { type, path: undefined },
    });
    while (true) {
      if (this.state.pick !== undefined) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    while (true) {
      if (this.state.pick === undefined) break;
      if (this.state.pick.path !== undefined) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (this.state.pick?.path !== undefined) {
      const value = this.state.pick?.path;
      this.setState({ pick: undefined });
      return value;
    } else {
      this.setState(() => ({
        pick: undefined,
      }));
      return false;
    }
  }

  @bind
  handlePickAbort() {
    if (this.state.pick !== undefined) {
      this.setState({
        pick: undefined,
      });
    }
  }

  @bind
  handlePickChoose(path: string) {
    if (this.state.pick !== undefined) {
      this.setState({
        pick: {
          ...this.state.pick,
          path: path,
        },
      });
    }
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
          <Quick.Branch alert={this.doAlert} prompt={this.doPrompt} />
          <Separator vertical />
          <Text>
            <Trans ns="translation" i18nKey="title.merge" />
          </Text>
          <Quick.Merge />
          <Separator vertical />
          <Text>
            <Trans ns="translation" i18nKey="title.commit" />
          </Text>
          <Quick.Commit />
        </Stack>
        <CustomPanel
          header={t("title.changes")}
          openKey="changePanelOpen"
          type={PanelType.custom}
        >
          <View.Changes />
        </CustomPanel>
        <CustomPanel
          header={t("title.tree")}
          openKey="fileTreeOpen"
          type={PanelType.customNear}
        >
          <View.Tree
            prompt={this.doPrompt}
            alert={this.doAlert}
            pickFile={this.doPick}
            onEdit={this.props.onEdit}
          />
        </CustomPanel>
        <CustomPanel
          header={t("title.history")}
          openKey="historyPanelOpen"
          type={PanelType.custom}
          width={"720px"}
        >
          <View.Log alert={this.doAlert} prompt={this.doPrompt} />
        </CustomPanel>
        <Dialog.Prompt
          isVisible={this.state.prompt !== undefined}
          title={this.state.prompt?.title || ""}
          defaultValue={this.state.prompt?.defaultValue || ""}
          onChange={this.handlePromptChange}
          onAbort={this.handlePromptAbort}
        />
        <Dialog.Alert
          isVisible={this.state.alert !== undefined}
          title={this.state.alert?.title || ""}
          onClose={this.handleAlertClose}
          onConfirm={
            this.state.alert?.canChoose ? this.handleAlertConfirm : undefined
          }
        />
        <Dialog.FilePicker
          isVisible={this.state.pick !== undefined}
          pickType={this.state.pick?.type || "file"}
          onAbort={this.handlePickAbort}
          onChoose={this.handlePickChoose}
        />
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

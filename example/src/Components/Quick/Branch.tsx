import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";

import Git from "react-git-provider";

import { Widget } from "..";

import "../../theme";

export interface BranchProps {
  prompt: (title: string, defaultValue: string) => Promise<string | false>;
  alert: (title: string) => Promise<boolean>;
}

export interface BranchState {
  actionMenuOpen: boolean;
}

class Branch extends Git.Component<
  BranchProps & Intl.WithTranslation,
  BranchState
> {
  static contextType = Git.Context;

  private actionButtonRef = React.createRef<HTMLSpanElement>();

  constructor(props: BranchProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      actionMenuOpen: false,
      gitWatch: {
        branch: {
          list: {},
          current: {},
        },
      },
    };
  }

  @bind
  async actionSwitchBranch(key: string) {
    const { branch } = this.state.gitValues;
    if (branch?.list === undefined) return;
    const { branch: branchIo } = this.context.io;
    if (!branch.list["local"].includes(key)) {
      await branchIo.create({ ref: key });
    }
    await branchIo.checkout({ ref: key });
  }

  @bind
  openActionMenu() {
    this.setState({ actionMenuOpen: true });
  }

  @bind
  closeActionMenu() {
    this.setState({ actionMenuOpen: false });
  }

  @bind
  async onDelete() {
    const { t } = this.props;
    const { branch } = this.state.gitValues;
    if (branch?.list === undefined || branch?.current === undefined) return;
    const { branch: branchIo } = this.context.io;
    if (branch.list["local"].length > 1) {
      const branchToRemove = branch.current;
      const switchTo = branch.list["local"].find(
        (name) => name !== branchToRemove
      );
      if (switchTo !== undefined) {
        await branchIo.checkout({ ref: switchTo });
        await branchIo.remove({ ref: branchToRemove });
      }
    } else {
      this.props.alert(t("error.branch.delete-not-enough"));
    }
  }

  @bind
  async onRename() {
    const { t } = this.props;
    const { branch } = this.state.gitValues;
    if (branch?.list === undefined || branch?.current === undefined) return;
    const { branch: branchIo } = this.context.io;
    const newRef = await this.props.prompt(
      t("action.branch.new-title"),
      branch.current
    );
    if (newRef !== false && branch.list["local"].includes(newRef)) {
      this.props.alert(t("error.branch.unique"));
    } else if (newRef !== false) {
      await branchIo.rename({
        oldRef: branch.current,
        newRef: newRef,
      });
    }
  }

  render() {
    const { t } = this.props;
    const { branch } = this.state.gitValues;
    return (
      <UI.Stack horizontal>
        <Widget.Branch
          filter="local"
          allowNewBranch={true}
          selection={branch?.current || undefined}
          onSelect={this.actionSwitchBranch}
        />
        <span ref={this.actionButtonRef}>
          <UI.IconButton
            className={iconButtonClass}
            iconProps={{ iconName: "Settings" }}
            onClick={this.openActionMenu}
          />
        </span>
        <UI.ContextualMenu
          hidden={!this.state.actionMenuOpen}
          onDismiss={this.closeActionMenu}
          items={[
            {
              key: "rename",
              name: t("action.branch.rename"),
              iconProps: { iconName: "Rename" },
              onClick: () => (this.onRename() && undefined) || undefined,
            },
            {
              key: "remove",
              name: t("action.branch.delete"),
              iconProps: { iconName: "Delete" },
              onClick: () => (this.onDelete() && undefined) || undefined,
            },
          ]}
          target={this.actionButtonRef as any}
        />
      </UI.Stack>
    );
  }
}

export default Intl.withTranslation("translation")(Branch);

const theme = UI.getTheme();
const iconButtonClass = UI.mergeStyles([
  {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
]);

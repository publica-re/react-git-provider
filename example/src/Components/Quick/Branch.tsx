import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation } from "react-i18next";

import Git, { GitBakers, GitValues, GitCommands } from "react-git-provider";

import { Widget } from "..";
import {
  Stack,
  IconButton,
  getTheme,
  mergeStyles,
  ContextualMenu,
} from "@fluentui/react";
import "../../theme";

export interface BranchProps {
  prompt: (title: string, defaultValue: string) => Promise<string | false>;
  alert: (title: string) => Promise<boolean>;
}

export interface BranchState {
  actionMenuOpen: boolean;
}

class Branch extends React.Component<
  BranchProps & WithTranslation,
  BranchState
> {
  static contextType = Git.Context;

  private actionButtonRef = React.createRef<HTMLSpanElement>();

  constructor(props: BranchProps & WithTranslation) {
    super(props);

    this.state = {
      actionMenuOpen: false,
    };
  }

  @bind
  async componentDidMount() {
    const { branchList, branchCurrent } = this.context.bakers as GitBakers;
    await branchList({});
    await branchCurrent({});
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
    const { branchList, branchCurrent } = this.context.values as GitValues;
    const { branchSwitch, branchRemove } = this.context.commands as GitCommands;
    if (branchList["local"].length > 1) {
      const branchToRemove = branchCurrent;
      const switchTo = branchList["local"].find(
        (name) => name !== branchToRemove
      );
      if (switchTo !== undefined) {
        await branchSwitch({ ref: switchTo });
        await branchRemove({ ref: branchToRemove });
      }
    } else {
      this.props.alert(t("error.branch.delete-not-enough"));
    }
  }

  @bind
  async onRename() {
    const { t } = this.props;
    const { branchList, branchCurrent } = this.context.values as GitValues;
    const { branchRename, branchSwitch } = this.context.commands as GitCommands;
    const newRef = await this.props.prompt(
      t("action.branch.new-title"),
      branchCurrent
    );
    if (newRef !== false && branchList["local"].includes(newRef)) {
      this.props.alert(t("error.branch.unique"));
    } else if (newRef !== false) {
      await branchRename({
        oldRef: branchCurrent,
        newRef: newRef,
      });
      await branchSwitch({ ref: newRef });
    }
  }

  render() {
    const { t } = this.props;
    return (
      <Stack horizontal>
        <Widget.Branch
          filter="local"
          allowNewBranch={true}
          selection={this.context.values.branchCurrent}
          onSelect={this.actionSwitchBranch}
        />
        <span ref={this.actionButtonRef}>
          <IconButton
            className={iconButtonClass}
            iconProps={{ iconName: "Settings" }}
            onClick={this.openActionMenu}
          />
        </span>
        <ContextualMenu
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
      </Stack>
    );
  }
}

export default withTranslation("translation")(Branch);

const theme = getTheme();
const iconButtonClass = mergeStyles([
  {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
]);

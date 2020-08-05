import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation } from "react-i18next";
import { Stack, IconButton, getTheme, mergeStyles } from "@fluentui/react";

import Git, { GitBakers } from "react-git-provider";

import { Branch } from ".";

export interface QuickMergeProps {}

export interface QuickMergeState {
  message: string;
  modifierKeyDown: boolean;
  leftToRight: boolean;
  leftTarget?: string;
  rightTarget?: string;
}

class QuickMerge extends React.Component<
  QuickMergeProps & WithTranslation,
  QuickMergeState
> {
  static contextType = Git.Context;

  constructor(props: QuickMergeProps & WithTranslation) {
    super(props);

    this.state = {
      message: "",
      modifierKeyDown: false,
      leftToRight: true,
    };
  }

  @bind
  async componentDidMount() {
    const { branchCurrent } = this.context.bakers as GitBakers;
    await branchCurrent({});
    document.addEventListener("keydown", (event) =>
      this.setState({ modifierKeyDown: event.ctrlKey })
    );
    document.addEventListener("keyup", () =>
      this.setState({ modifierKeyDown: false })
    );
  }

  render() {
    const { t } = this.props;
    return (
      <Stack horizontal>
        <Branch
          selection={this.state.leftTarget || "origin/master"}
          onSelect={(key) => this.setState({ leftTarget: key })}
        />
        <IconButton
          onClick={() =>
            this.setState(({ leftToRight }) => ({ leftToRight: !leftToRight }))
          }
          iconProps={{
            iconName: this.state.leftToRight
              ? "DoubleChevronRight12"
              : "DoubleChevronLeft12",
          }}
          className={iconButtonClass}
        />
        <Branch
          selection={
            this.state.rightTarget ||
            `local/${this.context.values.branchCurrent}`
          }
          onSelect={(key) => this.setState({ rightTarget: key })}
        />

        <IconButton
          iconProps={{
            iconName: "DiffSideBySide",
          }}
          title={t("action.diff")}
          className={iconButtonClass}
        />
        <IconButton
          iconProps={{
            iconName: this.state.modifierKeyDown ? "PublishContent" : "Upload",
          }}
          title={
            this.state.modifierKeyDown
              ? t("action.force-merge")
              : t("action.merge")
          }
          className={iconButtonClass}
        />
      </Stack>
    );
  }
}

export default withTranslation("translation")(QuickMerge);

const theme = getTheme();
const iconButtonClass = mergeStyles([
  {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
]);

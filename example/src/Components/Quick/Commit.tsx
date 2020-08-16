import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";

import Git, { GitStatusOption } from "react-git-provider";

import "../../theme";

export interface CommitProps {}

export interface CommitState {
  message: string;
  modifiedKeyDown: boolean;
}

class Commit extends Git.Component<
  CommitProps & Intl.WithTranslation,
  CommitState
> {
  static contextType = Git.Context;

  constructor(props: CommitProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      message: "",
      modifiedKeyDown: false,
      gitWatch: {
        directory: {
          status: {},
        },
      },
    };
  }

  @bind
  async componentDidMount() {
    super.componentDidMount();
    document.addEventListener("keydown", (event) =>
      this.setState({ modifiedKeyDown: event.ctrlKey })
    );
    document.addEventListener("keyup", () =>
      this.setState({ modifiedKeyDown: false })
    );
  }

  @bind
  private setMessage(message?: string) {
    this.setState({ message: message || "" });
  }

  @bind
  private doCommit() {
    const { repository } = this.context.io;
    const { directory } = this.state.gitValues;
    if (directory?.status === undefined) return;
    if (this.state.message?.length > 0) {
      const allStatuses = Object.values(directory.status);
      const anyStaged = allStatuses.some((value) => value?.status?.staged);
      if (this.state.modifiedKeyDown || !anyStaged) {
        repository.stageAndCommit({ message: this.state.message });
        this.setMessage();
      } else {
        repository.commit({ message: this.state.message });
        this.setMessage();
      }
    }
  }

  render() {
    const { t } = this.props;
    const { modifiedKeyDown } = this.state;
    const { directory } = this.state.gitValues;
    if (directory?.status === undefined) return null;
    const allStatuses = Object.values(directory.status);
    const anyStaged = allStatuses.some((value) => value?.status?.staged);
    const anyModified = allStatuses.some(
      (value) => value?.status?.option !== GitStatusOption.UnModified
    );
    return (
      <UI.Stack horizontal>
        <UI.TextField
          prefix={t("commit.message")}
          onChange={(_event: React.FormEvent, newValue?: string) =>
            this.setMessage(newValue)
          }
          value={this.state.message}
        />
        <UI.DefaultButton
          onClick={this.doCommit}
          disabled={!anyModified}
          text={
            modifiedKeyDown || !anyStaged
              ? anyModified
                ? t("commit.stage-commit")
                : t("commit.nothing")
              : t("commit.staged")
          }
        />
      </UI.Stack>
    );
  }
}

export default Intl.withTranslation("translation")(Commit);

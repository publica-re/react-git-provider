import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation } from "react-i18next";
import { Stack, TextField, DefaultButton } from "@fluentui/react";

import Git, {
  FileStatus,
  GitStatusOption,
  GitValues,
  GitBakers,
  GitCommands,
} from "react-git-provider";

export interface QuickCommitProps {}

export interface QuickCommitState {
  message: string;
  modifiedKeyDown: boolean;
}

class QuickCommit extends React.Component<
  QuickCommitProps & WithTranslation,
  QuickCommitState
> {
  static contextType = Git.Context;

  constructor(props: QuickCommitProps & WithTranslation) {
    super(props);

    this.state = {
      message: "",
      modifiedKeyDown: false,
    };
  }

  @bind
  async componentDidMount() {
    const { directoryStatus } = this.context.bakers as GitBakers;
    await directoryStatus({});
    document.addEventListener("keydown", (event) =>
      this.setState({ modifiedKeyDown: event.ctrlKey })
    );
    document.addEventListener("keyup", () =>
      this.setState({ modifiedKeyDown: false })
    );
  }

  @bind
  private doCommit() {
    const { repositoryStageAndCommit, repositoryCommit } = this.context
      .commands as GitCommands;
    if (this.state.message?.length > 0) {
      const { fileStatusTree } = this.context.values as GitValues;
      const anyStaged =
        (Object.values(fileStatusTree) as FileStatus[]).findIndex(
          (value) => value?.status?.staged
        ) > -1;
      if (this.state.modifiedKeyDown || !anyStaged) {
        repositoryStageAndCommit({ message: this.state.message });
        this.setState({ message: "" });
      } else {
        repositoryCommit({ message: this.state.message });
        this.setState({ message: "" });
      }
    }
  }

  render() {
    const { t } = this.props;
    const { fileStatusTree } = this.context.values as GitValues;
    const anyStaged =
      (Object.values(fileStatusTree) as FileStatus[]).findIndex(
        (value) => value?.status?.staged
      ) > -1;
    const anyModified =
      (Object.values(fileStatusTree) as FileStatus[]).findIndex(
        (value) => value?.status?.option !== GitStatusOption.UnModified
      ) > -1;
    return (
      <Stack horizontal>
        <TextField
          prefix={t("commit.message")}
          onChange={(_event: React.FormEvent, newValue?: string) =>
            newValue && this.setState({ message: newValue })
          }
          value={this.state.message}
        />
        <DefaultButton
          onClick={this.doCommit}
          disabled={!anyModified}
          text={
            this.state.modifiedKeyDown || !anyStaged
              ? anyModified
                ? t("commit.stage-commit")
                : t("commit.nothing")
              : t("commit.staged")
          }
        />
      </Stack>
    );
  }
}

export default withTranslation("translation")(QuickCommit);

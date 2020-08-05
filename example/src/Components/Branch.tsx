import * as React from "react";

import { withTranslation, WithTranslation } from "react-i18next";
import {
  ComboBox,
  SelectableOptionMenuItemType,
  IComboBox,
  IComboBoxOption,
} from "@fluentui/react";

import Git, { GitBakers, GitValues } from "react-git-provider";

export interface LogProps {
  filter?: "remote" | "local";
  selection?: string;
  onSelect?: (option: string) => void;
  allowNewBranch?: boolean;
}

export interface LogState {
  currentSelection: string;
}

class Branch extends React.Component<LogProps & WithTranslation, LogState> {
  static contextType = Git.Context;

  constructor(props: LogProps & WithTranslation) {
    super(props);

    this.state = {
      currentSelection: "",
    };
  }

  async componentDidMount() {
    const { branchList } = this.context.bakers as GitBakers;
    await branchList({});
  }

  prepareBranches(remotes: { [remote: string]: string[] }) {
    return Object.entries(remotes).flatMap(([remote, branches]) => [
      {
        key: `refs/${remote}`,
        text: remote,
        itemType: SelectableOptionMenuItemType.Header,
      },
      ...branches.map((branch) => ({
        key: this.props.filter === "local" ? branch : `${remote}/${branch}`,
        text: this.props.filter === "local" ? branch : `${remote}/${branch}`,
      })),
    ]);
  }
  render() {
    const { branchList } = this.context.values as GitValues;
    let branches = branchList;
    if (this.props.filter === "remote") {
      branches = Object.keys(branches)
        .filter((key: string) => key !== "local")
        .reduce((obj, key) => ({ ...obj, [key]: branches[key] }), {});
    } else if (this.props.filter === "local") {
      branches = Object.keys(branches)
        .filter((key: string) => key === "local")
        .reduce((obj, key) => ({ ...obj, [key]: branches[key] }), {});
    }

    return (
      <ComboBox
        allowFreeform={
          this.props.allowNewBranch !== undefined
            ? this.props.allowNewBranch
            : this.props.filter === "local"
        }
        autoComplete={"on"}
        selectedKey={this.props.selection}
        onChange={(
          event: React.FormEvent<IComboBox>,
          option?: IComboBoxOption
        ) => {
          const value =
            option?.key.toString() ||
            ((event.target as unknown) as { value: string }).value;
          this.props.onSelect && this.props.onSelect(value);
        }}
        options={this.prepareBranches(branches)}
      />
    );
  }
}

export default withTranslation("translation")(Branch);

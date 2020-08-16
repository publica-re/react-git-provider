import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";

import Git from "react-git-provider";

import "../../theme";

import { View } from "..";

interface RowType {
  oid: string;
  message: string;
  author: string;
  committer: string;
  date: string;
  timestamp: number;
}

export type LogColumn =
  | "oid"
  | "message"
  | "author"
  | "committer"
  | "date"
  | "timestamp";

const allColumns: LogColumn[] = [
  "oid",
  "message",
  "author",
  "committer",
  "date",
];

export interface LogProps {
  prompt: (title: string, defaultValue: string) => Promise<string | false>;
  columns?: LogColumn[];
  alert: (title: string) => Promise<boolean>;
}

export interface LogState {
  items: RowType[];
  sort: { column: LogColumn; ascending: boolean };
  currentFocus?: string;
  diff: {
    left?: string;
    right?: string;
  };
}

class Log extends Git.Component<LogProps & Intl.WithTranslation, LogState> {
  public static defaultProps = {
    columns: ["message", "author", "date"] as LogColumn[],
  };

  private contextMenuTarget: Record<string, HTMLElement | null> = {};

  constructor(props: LogProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      items: [],
      sort: { column: "date", ascending: false },
      currentFocus: undefined,
      diff: {
        left: undefined,
        right: undefined,
      },
      gitWatch: {
        branch: {
          commitHistory: {},
        },
      },
    };
  }

  @bind
  private onColumnClick(_event: React.MouseEvent, column: UI.IColumn) {
    const name = column.fieldName as string;
    if (this.state.sort.column === name) {
      this.setState(({ sort }) => ({
        sort: {
          column: sort.column,
          ascending: !sort.ascending,
        },
      }));
    } else {
      this.setState(() => ({
        sort: { column: name as LogColumn, ascending: true },
      }));
    }
  }

  @bind
  async onRebase(oid: string): Promise<void> {
    const { branch } = this.context.io;
    const rebaseResult = await branch.rebase({ oid: oid });
    if (rebaseResult.type === "error") {
      const { t } = this.props;
      this.props.alert(t("error.merge.changes"));
    }
  }

  @bind
  async onAmend(oid: string): Promise<void> {
    const { branch } = this.context.io;
    const rebaseResult = await branch.rebase({ oid: oid, noCheckout: true });
    if (rebaseResult.type === "error") {
      const { t } = this.props;
      this.props.alert(t("error.merge.changes"));
    }
  }

  @bind
  async onRevert(oid: string): Promise<void> {
    const { branch } = this.context.io;
    const checkoutResult = await branch.checkout({
      ref: oid,
      updateHead: false,
      checkout: true,
    });
    if (checkoutResult.type === "error") {
      const { t } = this.props;
      this.props.alert(t("error.merge.changes"));
    }
  }

  @bind
  async onNewBranch(oid: string): Promise<void> {
    const { t } = this.props;
    const { branch } = this.context.io;
    const name = await this.props.prompt(
      t("action.branch.new-branch-title"),
      oid
    );
    const branchList = await branch.list({});
    if (
      branchList.type === "success" &&
      name !== false &&
      !branchList.value["local"].includes(name)
    ) {
      await branch.create({ ref: name });
      await branch.rebase({ ref: name, oid: oid });
      await branch.checkout({ ref: name });
    } else if (name !== false) {
      this.props.alert(t("error.branch.unique"));
    }
  }

  @bind
  async onDiff(side: "left" | "right", oid: string): Promise<void> {
    this.setState(({ diff }) => ({ diff: { ...diff, [side]: oid } }));
  }

  @bind
  private makeColumns(): UI.IColumn[] {
    const { t, columns } = this.props;
    const cols = allColumns.filter((key) =>
      (columns as LogColumn[]).includes(key)
    );
    return cols.map((key) => ({
      key: key,
      fieldName: key,
      name: t(`log.column.${key}`),
      minWidth: 200,
      onColumnClick: this.onColumnClick,
      isSorted: this.state.sort.column === key,
      isSortedDescending: !this.state.sort.ascending,
      isResizable: true,
    }));
  }

  @bind
  private makeHistory() {
    const { branch } = this.state.gitValues;
    if (branch?.commitHistory === undefined) return [];
    const items = branch.commitHistory;
    const { column, ascending } = this.state.sort;
    return items
      .map((commit: any) => ({
        oid: commit.oid,
        message: commit.commit.message,
        author: `${commit.commit.author.name} <${commit.commit.author.email}>`,
        committer: `${commit.commit.committer.name} <${commit.commit.committer.email}>`,
        date: new Date(commit.commit.author.timestamp * 1000).toLocaleString(),
        timestamp: commit.commit.committer.timestamp,
      }))
      .sort((a, b) => {
        const t = (column !== "date" && column) || "timestamp";
        if (a[t] < b[t]) {
          return ascending ? -1 : 1;
        } else {
          return !ascending ? -1 : 1;
        }
      });
  }

  @bind
  renderRow(props?: UI.IDetailsRowProps) {
    if (props) {
      return (
        <div
          ref={(instance) =>
            (this.contextMenuTarget[props.item.oid] = instance)
          }
          onClick={() => this.setState({ currentFocus: props.item.oid })}
        >
          <UI.DetailsRow {...props} indentWidth={0} />
        </div>
      );
    }
    return null;
  }

  @bind
  renderContextMenuItems() {
    const { t } = this.props;
    return [
      {
        key: "ammend",
        text: t("log.action.ammend"),
        iconProps: { iconName: "Repair" },
        onClick: () =>
          (this.state.currentFocus &&
            this.onAmend(this.state.currentFocus) &&
            undefined) ||
          undefined,
      },
      {
        key: "revert",
        text: t("log.action.revert"),
        iconProps: { iconName: "Installation" },
        onClick: () =>
          (this.state.currentFocus &&
            this.onRevert(this.state.currentFocus) &&
            undefined) ||
          undefined,
      },
      {
        key: "rebase",
        text: t("log.action.rebase"),
        iconProps: { iconName: "DrillThrough" },
        onClick: () =>
          (this.state.currentFocus &&
            this.onRebase(this.state.currentFocus) &&
            undefined) ||
          undefined,
      },
      {
        key: "new-branch",
        text: t("log.action.new-branch"),
        iconProps: { iconName: "AzureServiceEndpoint" },
        onClick: () =>
          (this.state.currentFocus &&
            this.onNewBranch(this.state.currentFocus) &&
            undefined) ||
          undefined,
      },
      {
        key: "diff",
        text: t("log.action.diff"),
        iconProps: { iconName: "DiffSideBySide" },
        subMenuProps: {
          items: [
            {
              key: "diff-left",
              text: t("log.action.diff-left"),
              iconProps: { iconName: "InsertColumnsLeft" },
              onClick: () =>
                (this.state.currentFocus &&
                  this.onDiff("left", this.state.currentFocus) &&
                  undefined) ||
                undefined,
            },
            {
              key: "diff-right",
              text: t("log.action.diff-right"),
              iconProps: { iconName: "InsertColumnsRight" },
              onClick: () =>
                (this.state.currentFocus &&
                  this.onDiff("right", this.state.currentFocus) &&
                  undefined) ||
                undefined,
            },
          ],
        },
      },
    ];
  }

  render() {
    return (
      <React.Fragment>
        <UI.ShimmeredDetailsList
          compact={true}
          columns={this.makeColumns()}
          items={this.makeHistory()}
          selectionMode={UI.SelectionMode.none}
          onRenderRow={this.renderRow}
        />
        <UI.ContextualMenu
          hidden={this.state.currentFocus === undefined}
          onDismiss={() => this.setState({ currentFocus: undefined })}
          items={this.renderContextMenuItems()}
          target={
            this.state.currentFocus &&
            this.contextMenuTarget[this.state.currentFocus]
          }
        />
        {this.state.diff.left && this.state.diff.right && (
          <View.Diff
            left={this.state.diff.left}
            right={this.state.diff.right}
            onClose={() =>
              this.setState({ diff: { left: undefined, right: undefined } })
            }
          />
        )}
      </React.Fragment>
    );
  }
}

export default Intl.withTranslation("translation")(Log);

import * as React from "react";
import bind from "bind-decorator";

import "../../theme";

import { withTranslation, WithTranslation } from "react-i18next";
import {
  ShimmeredDetailsList,
  IColumn,
  SelectionMode,
  DetailsRow,
  IDetailsRowProps,
  ContextualMenu,
} from "@fluentui/react";

import Git, {
  ReadCommitResult,
  GitValues,
  GitBakers,
  GitCommands,
  GitInternal,
} from "react-git-provider";

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

class Log extends React.Component<LogProps & WithTranslation, LogState> {
  static contextType = Git.Context;

  public static defaultProps = {
    columns: ["message", "author", "date"] as LogColumn[],
  };

  private contextMenuTarget: Record<string, HTMLElement | null> = {};

  constructor(props: LogProps & WithTranslation) {
    super(props);

    this.state = {
      items: [],
      sort: { column: "date", ascending: false },
      currentFocus: undefined,
      diff: {
        left: undefined,
        right: undefined,
      },
    };
  }

  async componentDidMount() {
    const { commitHistory } = this.context.bakers as GitBakers;
    await commitHistory({});
  }

  @bind
  private onColumnClick(_event: React.MouseEvent, column: IColumn) {
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
    const { branchCheckout } = this.context.commands as GitCommands;
    await branchCheckout({ oid: oid, updateHead: true, checkout: true });
  }

  @bind
  async onRevert(oid: string): Promise<void> {
    const { branchCheckout } = this.context.commands as GitCommands;
    await branchCheckout({ oid: oid, updateHead: false, checkout: true });
  }

  @bind
  async onNewBranch(oid: string): Promise<void> {
    const { t } = this.props;
    const { branchCreate, branchSwitch } = this.context.commands as GitCommands;
    const name = await this.props.prompt(
      t("action.branch.new-branch-title"),
      oid
    );
    const { branchList: branchListBaker } = this.context.bakers as GitBakers;
    const { branchList } = this.context.values as GitValues;
    await branchListBaker({});
    if (name !== false && !branchList["local"].includes(name)) {
      const { git, fs, basepath } = this.context.internal as GitInternal;
      await branchCreate({ ref: name });
      await branchSwitch({ ref: name });
      const ref = await git.resolveRef({
        fs: fs,
        dir: basepath,
        ref: "HEAD",
        depth: 2,
      });
      console.log(ref);

      await git.writeRef({
        fs,
        dir: basepath,
        ref: "HEAD",
        value: ref,
        force: true,
        symbolic: true,
      });
      // await branchCheckout({ oid: oid, checkout: true, updateHead: true });
    } else if (name !== false) {
      this.props.alert(t("error.branch.unique"));
    }
  }

  @bind
  async onDiff(side: "left" | "right", oid: string): Promise<void> {
    this.setState(({ diff }) => ({ diff: { ...diff, [side]: oid } }));
    if (
      this.state.diff.left !== undefined &&
      this.state.diff.right !== undefined
    ) {
      console.log("diffing", this.state.diff);
    }
  }

  @bind
  private makeColumns(): IColumn[] {
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
  private makeHistory(
    items: ReadCommitResult[],
    { column, ascending }: { column: LogColumn; ascending: boolean }
  ) {
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
  renderRow(props?: IDetailsRowProps) {
    if (props) {
      return (
        <div
          ref={(instance) =>
            (this.contextMenuTarget[props.item.oid] = instance)
          }
          onClick={() => this.setState({ currentFocus: props.item.oid })}
        >
          <DetailsRow {...props} indentWidth={0} />
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
        key: "rebase",
        text: t("log.action.rebase"),
        iconProps: { iconName: "Download" },
        onClick: () =>
          (this.state.currentFocus &&
            this.onRebase(this.state.currentFocus) &&
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
    const { commitHistory } = this.context.values as GitValues;
    return (
      <React.Fragment>
        <ShimmeredDetailsList
          compact={true}
          columns={this.makeColumns()}
          items={this.makeHistory(commitHistory, this.state.sort)}
          selectionMode={SelectionMode.none}
          onRenderRow={this.renderRow}
        />
        <ContextualMenu
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

export default withTranslation("translation")(Log);

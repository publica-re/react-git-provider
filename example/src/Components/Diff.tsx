import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation } from "react-i18next";
import DiffViewer from "react-diff-viewer";

import Git, {
  GitValues,
  FileStatus,
  GitBakers,
  GitCommands,
  GitStatusOption,
} from "react-git-provider";
import { Stack } from "@fluentui/react";

export interface DiffProps {
  left: string;
  right: string;
}

export interface DiffState {
  status?: {
    [path: string]: { status: FileStatus; left: string; right: string };
  };
}

class Diff extends React.Component<DiffProps & WithTranslation, DiffState> {
  static contextType = Git.Context;

  constructor(props: DiffProps & WithTranslation) {
    super(props);

    this.state = {
      status: undefined,
    };
  }

  async componentDidUpdate(prevProps: DiffProps) {
    if (
      prevProps.left !== this.props.left ||
      prevProps.right !== this.props.right
    ) {
      await this.makeDiff();
    }
  }

  async componentDidMount() {
    await this.makeDiff();
  }

  @bind
  async makeDiff() {
    const { branchCreate, branchSwitch, branchCheckout, branchRemove } = this
      .context.commands as GitCommands;
    const { directoryStatus } = this.context.bakers as GitBakers;
    const { branchCurrent: branchCurrentBaker, fileRead } = this.context
      .bakers as GitBakers;
    const { branchCurrent } = this.context.values as GitValues;
    await branchCurrentBaker({});
    const name = `diff-${this.props.right}`;
    const oldBranch = branchCurrent;
    await branchCreate({ ref: name });
    await branchSwitch({ ref: name });
    await branchCheckout({
      oid: this.props.right,
    });
    const out = {};
    const statusTree = await directoryStatus({
      ref: this.props.left,
    });
    for (const [path, status] of Object.entries(statusTree)) {
      if ((status as any).status?.option !== GitStatusOption.UnModified) {
        try {
          out[path] = {
            status: status,
            left: await fileRead({ path: path }),
          };
        } catch (e) {}
      }
    }
    await branchCheckout({
      oid: this.props.left,
    });
    for (const [path, status] of Object.entries(statusTree)) {
      if ((status as any).status?.option !== GitStatusOption.UnModified) {
        try {
          out[path].right = await fileRead({ path: path });
        } catch (e) {}
      }
    }
    await directoryStatus({ ref: this.props.left });
    await branchSwitch({ ref: oldBranch });
    await branchRemove({ ref: name });
    console.log(statusTree, out);

    this.setState({
      status: out,
    });
  }

  render() {
    return (
      <Stack>
        {this.state.status &&
          Object.entries(this.state.status).map(([path, { left, right }]) => (
            <Stack>
              <h1>{path}</h1>
              <DiffViewer oldValue={left} newValue={right} splitView={true} />
            </Stack>
          ))}
      </Stack>
    );
  }
}

export default withTranslation("translation")(Diff);

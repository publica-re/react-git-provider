import * as React from "react";
import Context from "../../Context";
import TreeItem from "@material-ui/lab/TreeItem";
import bind from "bind-decorator";
import { FileCopy } from "@material-ui/icons";
import { Switch } from "@material-ui/core";

export interface ListFileProps {
  path: string;
  fileName: string;
  id: string;
}

export interface ListFileState {
  status: string;
}

export default class ListFile extends React.Component<
  ListFileProps,
  ListFileState
> {
  static contextType = Context;

  constructor(props: ListFileProps) {
    super(props);

    this.state = {
      status: "",
    };
  }

  @bind
  async componentDidMount(): Promise<void> {
    const { fs, git } = this.context.internal;
    console.log(
      this.props.path,
      this.props.fileName,
      git
        .status({
          fs,
          dir: this.props.path,
          filepath: this.props.fileName,
        })
        .then(console.log)
    );
    const status = (await git.status({
      fs,
      dir: this.props.path,
      filepath: this.props.fileName,
    })) as string;

    this.setState({
      status: status,
    });
  }

  render(): React.ReactNode {
    return (
      <TreeItem
        nodeId={this.props.id}
        label={
          <span>
            {this.props.fileName} l{this.state.status}{" "}
            <Switch
              checked={this.state.status.startsWith("*")}
              color="primary"
              title={"is staged"}
            />
          </span>
        }
        icon={<FileCopy />}
      />
    );
  }
}

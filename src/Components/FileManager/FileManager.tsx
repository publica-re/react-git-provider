import * as React from "react";
import Context from "../../Context";
import TreeView from "@material-ui/lab/TreeView";
import ListDirectory from "./ListDirectory";

export interface FileManagerProps {
  path: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FileManagerState {}

export default class FileManager extends React.Component<
  FileManagerProps,
  FileManagerState
> {
  static contextType = Context;

  render(): React.ReactNode {
    return (
      <TreeView>
        <ListDirectory
          path={this.props.path}
          fileName={this.props.path}
          id={"0"}
        />
      </TreeView>
    );
  }
}

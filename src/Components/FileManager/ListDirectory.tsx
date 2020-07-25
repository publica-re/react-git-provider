import * as React from "react";
import Context from "../../Context";
import TreeItem from "@material-ui/lab/TreeItem";
import ListFile from "./ListFile";
import bind from "bind-decorator";
import { Folder, FolderOpen, NoteAdd } from "@material-ui/icons";

export type ObjectType = {
  path: string;
  fileName: string;
  type: "file" | "directory";
};

export interface ListDirectoryProps {
  path: string;
  fileName: string;
  id: string;
}

export interface ListDirectoryState {
  objects: ObjectType[];
  dragFocus: boolean;
}

export default class ListDirectory extends React.Component<
  ListDirectoryProps,
  ListDirectoryState
> {
  static contextType = Context;

  constructor(props: ListDirectoryProps) {
    super(props);

    this.state = {
      objects: [],
      dragFocus: false,
    };
  }

  @bind
  async componentDidMount(): Promise<void> {
    const { listFiles } = this.context;
    this.setState({
      objects: await listFiles(`${this.props.path}/${this.props.fileName}`),
    });
  }

  @bind
  renderObjects(): React.ReactNode {
    return this.state.objects.map((obj, index) => {
      const id = `${this.props.id}.${index}`;
      if (obj.type === "file") {
        return (
          <ListFile path={obj.path} fileName={obj.fileName} id={id} key={id} />
        );
      } else {
        return (
          <ListDirectory
            path={obj.path}
            fileName={obj.fileName}
            id={id}
            key={id}
          />
        );
      }
    });
  }

  @bind
  dragEnter(): void {
    this.setState({
      dragFocus: true,
    });
  }

  @bind
  dragLeave(): void {
    this.setState({
      dragFocus: false,
    });
  }

  render(): React.ReactNode {
    return (
      <TreeItem
        nodeId={this.props.id}
        key={this.props.id}
        onDragEnter={this.dragEnter}
        onDragLeave={this.dragLeave}
        label={
          <span
            style={{
              fontStyle: this.state.dragFocus ? "italic" : "",
            }}
          >
            {this.props.fileName}
          </span>
        }
        icon={this.state.dragFocus ? <NoteAdd /> : <Folder />}
        expandIcon={<FolderOpen />}
      >
        {this.renderObjects()}
      </TreeItem>
    );
  }
}

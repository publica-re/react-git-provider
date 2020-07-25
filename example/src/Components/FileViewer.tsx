import * as React from "react";
import Git from "react-git-provider";

export interface Props {
  path: string;
  children?: React.ReactNode;
}

export interface State {
  content: string;
}

export default class FileViewer extends React.Component<Props, State> {
  static contextType = Git.Context;
  constructor(props: Props) {
    super(props);
    this.saveFile = this.saveFile.bind(this);
    this.state = {
      content: "",
    };
  }

  async loadFile(workPath = this.props.path) {
    console.log("reading", workPath);

    /*
    const { readFile } = this.context;
    console.log("loading file");

    this.setState({ content: await readFile(workPath) });*/
  }

  async componentDidMount() {
    await this.loadFile();
  }

  async UNSAFE_componentWillReceiveProps(nextProps: Props) {
    this.loadFile(nextProps.path);
  }

  async saveFile(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const { writeFile } = this.context;
    this.setState({ content: event.target.value });
    await writeFile(this.props.path, event.target.value);
  }

  render() {
    return (
      <div className="data">
        <textarea
          value={this.state.content}
          onChange={this.saveFile}
          spellCheck={false}
        />
      </div>
    );
  }
}

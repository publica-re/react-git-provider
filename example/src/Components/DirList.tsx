import * as React from "react";
import Git from "react-git-provider";

export interface Props {
  path: string;
  openDirectory: (newPath: string) => void;
  openFile: (newPath: string) => void;
  children?: React.ReactNode;
}

export interface State {
  files: { path: string; typeString: string; type: string; status: string }[];
}

export default class DirList extends React.Component<Props, State> {
  static contextType = Git.Context;

  constructor(props: Props) {
    super(props);

    this.state = {
      files: [],
    };

    this.goToParent = this.goToParent.bind(this);
    this.loadFiles = this.loadFiles.bind(this);
  }

  async loadFiles(path = this.props.path) {
    const workPath = path.startsWith("/") ? path : `/${path}`;
    const { fs, git } = this.context;
    const root = await fs.readdir(workPath);
    const output = [];
    for (let obj of root) {
      if (obj !== ".git") {
        const objPath = `${
          workPath.endsWith("/") ? workPath : `${workPath}/`
        }${obj}`;
        console.log(objPath);

        const objFile = await (await fs.stat(objPath)).isFile();
        let objStatus = null;
        if (objFile)
          objStatus = await git.status({ fs, dir: workPath, filepath: obj });
        output.push({
          path: objPath,
          typeString: objFile ? "📄" : "📁",
          type: objFile ? "file" : "dir",
          status: objStatus,
        });
      }
    }
    this.setState({
      files: output,
    });
  }

  async componentDidMount() {
    await this.loadFiles();
  }

  goToParent() {
    const pathWork = this.props.path.split("/");
    const newPath = pathWork.slice(0, pathWork.length - 1).join("/");
    return this.props.openDirectory(newPath);
  }

  render() {
    return (
      <div className="directories">
        <ul>
          <li onClick={this.goToParent}>
            <span role="img" aria-label="folder">
              📁
            </span>{" "}
            ..
          </li>
          {this.state.files.map((file) => (
            <li
              key={`file-${file.path}`}
              onClick={() =>
                file.type === "file"
                  ? this.props.openFile(file.path)
                  : this.props.openDirectory(file.path)
              }
            >
              <span role="img" aria-label={file.type}>
                {file.typeString}
              </span>{" "}
              {file.path.slice(1)} ({file.status})
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

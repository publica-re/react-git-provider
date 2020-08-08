import React, { Suspense } from "react";
import Git, { AuthComponentProps } from "react-git-provider";
import "../i18n";
import { ActionMenu, Utils, Dialog } from ".";

import { Fabric, Stack, mergeStyles, getTheme } from "@fluentui/react";

import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import "../theme";

initializeIcons();

export interface TaskBarProps {
  repositoryUri: string;
  onEdit: (path: string) => void;
  author?: { name: string; email: string };
  corsProxy?: string;
  behaviour?: "gitlab";
}

export interface TaskBarState {
  author?: { name: string; email: string };
  repositoryPath: string;
}

class TaskBar extends React.Component<TaskBarProps, TaskBarState> {
  public static defaultProps = {
    corsProxy: "https://cors.isomorphic-git.org/",
  };
  public static defaultAuthor = {
    name: "react-git-taskbar",
    email: "contact@publica.re",
  };

  constructor(props: TaskBarProps) {
    super(props);
    this.state = {
      repositoryPath: `/${btoa(this.props.repositoryUri)}`,
    };
  }

  componentDidUpdate(prevProps: TaskBarProps) {
    if (prevProps.repositoryUri !== this.props.repositoryUri) {
      this.setState({
        repositoryPath: `/${btoa(this.props.repositoryUri)}`,
      });
    }
  }

  render() {
    const AuthDialog: React.FC<AuthComponentProps> = (props) => (
      <Dialog.Auth {...props} behaviour={this.props.behaviour} />
    );
    return (
      <Suspense fallback={<Utils.Loader message="Initial load" />}>
        <Git.Provider
          uri={this.props.repositoryUri}
          corsProxy={this.props.corsProxy}
          author={this.props.author || TaskBar.defaultAuthor}
          basepath={this.state.repositoryPath}
          loader={Utils.Loader}
          auth={{ type: "element", value: AuthDialog }}
        >
          <Fabric>
            <Stack>
              <div className={contentClass}>{this.props.children}</div>
              <ActionMenu onEdit={this.props.onEdit} />
            </Stack>
          </Fabric>
        </Git.Provider>
      </Suspense>
    );
  }
}

export default TaskBar;

const theme = getTheme();
const contentClass = mergeStyles([
  {
    display: "flex",
    height: "calc(100vh - 4em)",
    width: "100vw",
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: theme.palette.neutralLighterAlt,
  },
]);

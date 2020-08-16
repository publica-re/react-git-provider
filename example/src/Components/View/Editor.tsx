import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";

import Git, { GitComponentState } from "react-git-provider";

import "../../theme";

export interface EditorProps {
  filePath: string;
}

export interface EditorState {
  currentContent?: string;
}

class Editor extends Git.Component<
  EditorProps & Intl.WithTranslation,
  EditorState
> {
  constructor(props: EditorProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      currentContent: "",
      gitWatch: {
        file: {
          read: { path: props.filePath, mode: "text" },
        },
      },
    };
  }

  @bind
  async componentDidUpdate(
    prevProps: EditorProps,
    prevState: EditorState & GitComponentState
  ) {
    super.componentDidUpdate(prevProps, prevState);
    if (prevProps.filePath !== this.props.filePath) {
      this.setState(({ gitWatch }) => ({
        gitWatch: {
          ...gitWatch,
          file: {
            ...gitWatch.file,
            read: { path: this.props.filePath, mode: "text" },
          },
        },
      }));
    }
    if (prevState.gitValues.file?.read !== this.state.gitValues.file?.read) {
      this.setState({
        currentContent: (this.state.gitValues.file?.read || "") as string,
      });
    }
  }

  @bind
  async save() {
    const { file } = this.context.io;
    await file.write({
      path: this.props.filePath,
      content: this.state.currentContent || "",
    });
  }

  render() {
    return (
      <UI.Stack className={contentClass}>
        <UI.PrimaryButton onClick={this.save} style={{ height: "2em" }}>
          <Intl.Trans ns="translation" i18nKey="file.save" />
        </UI.PrimaryButton>
        <UI.TextField
          multiline
          className={inputClass}
          borderless={true}
          style={{ height: "calc(100vh - 6em)" }}
          onChange={(_event: React.FormEvent, newValue?: string) =>
            newValue &&
            this.setState({
              currentContent: newValue,
            })
          }
          value={this.state.currentContent}
        />
      </UI.Stack>
    );
  }
}

export default Intl.withTranslation("translation")(Editor);

const contentClass = UI.mergeStyles([
  {
    display: "flex",
    flex: "1",
    height: "100%",
    overflow: "hidden",
  },
]);

const inputClass = UI.mergeStyles([
  {
    height: "100%",
  },
]);

import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation, Trans } from "react-i18next";
import { TextField, PrimaryButton, Stack, mergeStyles } from "@fluentui/react";

import Git, { GitBakers, GitValues, GitCommands } from "react-git-provider";

export interface EditorProps {
  filePath: string;
}

export interface EditorState {
  initialContent?: string;
  currentContent?: string;
}

class Editor extends React.Component<
  EditorProps & WithTranslation,
  EditorState
> {
  static contextType = Git.Context;

  constructor(props: EditorProps & WithTranslation) {
    super(props);

    this.state = {
      initialContent: "",
      currentContent: "",
    };
  }

  @bind
  async componentDidMount() {
    const { fileRead } = this.context.bakers as GitBakers;
    await fileRead({ path: this.props.filePath, mode: "text" });
    const { fileData } = this.context.values as GitValues;
    this.setState({
      initialContent: fileData,
      currentContent: fileData,
    });
  }

  @bind
  async componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
    const { fileRead } = this.context.bakers as GitBakers;
    const { fileData } = this.context.values as GitValues;

    if (prevProps.filePath !== this.props.filePath) {
      await fileRead({ path: this.props.filePath });
    } else {
      if (fileData !== prevState.initialContent) {
        this.setState({
          initialContent: fileData,
          currentContent: fileData,
        });
      }
    }
  }

  @bind
  save() {
    const { fileWrite } = this.context.commands as GitCommands;
    fileWrite({
      path: this.props.filePath,
      content: this.state.currentContent || this.state.initialContent || "",
    });
  }

  render() {
    return (
      <Stack className={contentClass}>
        <PrimaryButton onClick={this.save}>
          <Trans ns="translation" i18nKey="file.save" />
        </PrimaryButton>
        <TextField
          multiline
          className={inputClass}
          borderless={true}
          onChange={(_event: React.FormEvent, newValue?: string) =>
            newValue &&
            this.setState({
              currentContent: newValue,
            })
          }
          value={this.state.currentContent}
        />
      </Stack>
    );
  }
}

export default withTranslation("translation")(Editor);

const contentClass = mergeStyles([
  {
    display: "flex",
    flex: "1",
  },
]);

const inputClass = mergeStyles([
  {
    height: "100%",
  },
]);

import * as React from "react";

import { WithTranslation, withTranslation, Trans } from "react-i18next";
import {
  DefaultButton,
  PrimaryButton,
  TextField,
  DialogContent,
  DialogFooter,
  Dialog,
} from "@fluentui/react";
import "../../theme";

import Git from "react-git-provider";

export interface PromptProps {
  title: string;
  defaultValue: string;
  isVisible: boolean;
  onChange: (value: string) => void;
  onAbort: () => void;
}

export interface PromptState {
  currentValue: string;
}

class Prompt extends React.Component<
  PromptProps & WithTranslation,
  PromptState
> {
  static contextType = Git.Context;

  constructor(props: PromptProps & WithTranslation) {
    super(props);

    this.state = {
      currentValue: props.defaultValue,
    };
  }

  componentDidUpdate(prevProps: PromptProps) {
    if (prevProps.defaultValue !== this.props.defaultValue) {
      this.setState({ currentValue: this.props.defaultValue });
    }
  }

  render() {
    return (
      <Dialog
        hidden={!this.props.isVisible}
        modalProps={{
          isBlocking: false,
        }}
        dialogContentProps={{
          title: this.props.title,
        }}
        onDismiss={this.props.onAbort}
      >
        <DialogContent>
          <TextField
            value={this.state.currentValue}
            autoFocus={true}
            onChange={(_event, option) =>
              option !== undefined && this.setState({ currentValue: option })
            }
          />
        </DialogContent>
        <DialogFooter>
          <DefaultButton onClick={this.props.onAbort}>
            <Trans ns="translation" i18nKey="dialog.cancel" />
          </DefaultButton>
          <PrimaryButton
            onClick={() => this.props.onChange(this.state.currentValue)}
          >
            <Trans ns="translation" i18nKey="dialog.confirm" />
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    );
  }
}

export default withTranslation("translation")(Prompt);

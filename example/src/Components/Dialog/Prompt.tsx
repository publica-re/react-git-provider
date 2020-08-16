import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";

import Git, { GitComponentState } from "react-git-provider";

import "../../theme";

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

class Prompt extends Git.Component<
  PromptProps & Intl.WithTranslation,
  PromptState
> {
  constructor(props: PromptProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      currentValue: props.defaultValue,
    };
  }

  componentDidUpdate(
    prevProps: PromptProps,
    prevState: PromptState & GitComponentState
  ) {
    super.componentDidUpdate(prevProps, prevState);
    if (prevProps.defaultValue !== this.props.defaultValue) {
      this.setState({ currentValue: this.props.defaultValue });
    }
  }

  render() {
    const { isVisible, title, onAbort } = this.props;
    return (
      <UI.Dialog
        hidden={!isVisible}
        modalProps={{
          isBlocking: false,
        }}
        dialogContentProps={{
          title: title,
        }}
        onDismiss={onAbort}
      >
        <UI.DialogContent>
          <UI.TextField
            value={this.state.currentValue}
            autoFocus={true}
            onChange={(_event, option) =>
              option !== undefined && this.setState({ currentValue: option })
            }
          />
        </UI.DialogContent>
        <UI.DialogFooter>
          <UI.DefaultButton onClick={this.props.onAbort}>
            <Intl.Trans ns="translation" i18nKey="dialog.cancel" />
          </UI.DefaultButton>
          <UI.PrimaryButton
            onClick={() => this.props.onChange(this.state.currentValue)}
          >
            <Intl.Trans ns="translation" i18nKey="dialog.confirm" />
          </UI.PrimaryButton>
        </UI.DialogFooter>
      </UI.Dialog>
    );
  }
}

export default Intl.withTranslation("translation")(Prompt);

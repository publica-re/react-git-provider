import * as React from "react";

import { WithTranslation, withTranslation, Trans } from "react-i18next";
import {
  DefaultButton,
  PrimaryButton,
  Dialog,
  DialogFooter,
} from "@fluentui/react";
import "../../theme";

import Git from "react-git-provider";

export interface AlertProps {
  title: string;
  isVisible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export interface AlertState {}

class Alert extends React.Component<AlertProps & WithTranslation, AlertState> {
  static contextType = Git.Context;

  constructor(props: AlertProps & WithTranslation) {
    super(props);

    this.state = {};
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
        onDismiss={this.props.onClose}
      >
        <DialogFooter>
          {this.props.onConfirm !== undefined ? (
            <React.Fragment>
              <DefaultButton onClick={this.props.onClose}>
                <Trans ns="translation" i18nKey="dialog.cancel" />
              </DefaultButton>
              <PrimaryButton onClick={this.props.onConfirm}>
                <Trans ns="translation" i18nKey="dialog.confirm" />
              </PrimaryButton>
            </React.Fragment>
          ) : (
            <PrimaryButton onClick={this.props.onClose}>
              <Trans ns="translation" i18nKey="dialog.confirm" />
            </PrimaryButton>
          )}
        </DialogFooter>
      </Dialog>
    );
  }
}

export default withTranslation("translation")(Alert);

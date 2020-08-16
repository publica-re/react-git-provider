import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";

import Git from "react-git-provider";

import "../../theme";

export interface AlertProps {
  title: string;
  isVisible: boolean;
  canChoose: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export interface AlertState {}

class Alert extends Git.Component<
  AlertProps & Intl.WithTranslation,
  AlertState
> {
  render() {
    const { title, isVisible, onClose, onConfirm, canChoose } = this.props;
    return (
      <UI.Dialog
        hidden={!isVisible}
        modalProps={{
          isBlocking: false,
        }}
        dialogContentProps={{
          title: title,
        }}
        onDismiss={onClose}
      >
        <UI.DialogFooter>
          {canChoose ? (
            <React.Fragment>
              <UI.DefaultButton onClick={onClose}>
                <Intl.Trans ns="translation" i18nKey="dialog.cancel" />
              </UI.DefaultButton>
              <UI.PrimaryButton onClick={onConfirm}>
                <Intl.Trans ns="translation" i18nKey="dialog.confirm" />
              </UI.PrimaryButton>
            </React.Fragment>
          ) : (
            <UI.PrimaryButton onClick={onConfirm}>
              <Intl.Trans ns="translation" i18nKey="dialog.confirm" />
            </UI.PrimaryButton>
          )}
        </UI.DialogFooter>
      </UI.Dialog>
    );
  }
}

export default Intl.withTranslation("translation")(Alert);

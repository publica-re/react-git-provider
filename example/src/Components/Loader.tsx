import * as React from "react";

import { withTranslation, WithTranslation } from "react-i18next";
import {
  Overlay,
  Spinner,
  SpinnerSize,
  IOverlayStyles,
  getTheme,
  Layer,
} from "@fluentui/react";

export interface LoaderProps {
  message: string;
}

export interface LoaderState {}

const theme = getTheme();
const overlayStyle: IOverlayStyles = {
  root: {
    backgroundColor: theme.palette.blackTranslucent40,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

class Loader extends React.Component<
  LoaderProps & WithTranslation,
  LoaderState
> {
  render() {
    return (
      <Layer>
        <Overlay styles={overlayStyle}>
          <Spinner
            label={this.props.message}
            size={SpinnerSize.large}
            color={theme.palette.white}
          />
        </Overlay>
      </Layer>
    );
  }
}

export default withTranslation("translation")(Loader);

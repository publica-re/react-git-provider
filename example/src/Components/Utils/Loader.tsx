import * as React from "react";

import {
  Overlay,
  Spinner,
  SpinnerSize,
  IOverlayStyles,
  getTheme,
  Layer,
} from "@fluentui/react";
import "../../theme";

export interface LoaderProps {
  message: string;
}

export interface LoaderState {}

class Loader extends React.Component<LoaderProps, LoaderState> {
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

export default Loader;

const theme = getTheme();
const overlayStyle: IOverlayStyles = {
  root: {
    backgroundColor: theme.palette.whiteTranslucent40,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

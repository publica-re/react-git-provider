import * as React from "react";
import * as UI from "@fluentui/react";

import "../../theme";

export interface LoaderProps {
  message: string;
}

export interface LoaderState {}

class Loader extends React.Component<LoaderProps, LoaderState> {
  render() {
    return (
      <UI.Layer>
        <UI.Overlay styles={overlayStyle}>
          <UI.Spinner
            label={this.props.message}
            size={UI.SpinnerSize.large}
            color={theme.palette.white}
          />
        </UI.Overlay>
      </UI.Layer>
    );
  }
}

export default Loader;

const theme = UI.getTheme();
const overlayStyle: UI.IOverlayStyles = {
  root: {
    backgroundColor: theme.palette.whiteTranslucent40,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

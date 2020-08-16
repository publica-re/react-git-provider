import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";

import { MergeConflictSolution } from "react-git-provider";

import "../../theme";

export interface MergeConflictProps {
  mergeConflicts: MergeConflictSolution[];
  onResolve: (conflicts: MergeConflictSolution[]) => void;
  onAbort: () => void;
}

export interface MergeConflictState {
  conflictAnalysis: MergeConflictSolution[];
}

class MergeConflict extends React.Component<
  MergeConflictProps & Intl.WithTranslation,
  MergeConflictState
> {
  constructor(props: MergeConflictProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      conflictAnalysis: [],
    };
  }

  async componentDidUpdate(prevProps: MergeConflictProps) {
    if (!Object.is(prevProps.mergeConflicts, this.props.mergeConflicts)) {
      this.setState({
        conflictAnalysis: this.props.mergeConflicts,
      });
    }
  }

  async componentDidMount() {
    this.setState({
      conflictAnalysis: this.props.mergeConflicts,
    });
  }

  @bind
  toggleAccept(index: number) {
    const targetConflict = this.state.conflictAnalysis[index];
    targetConflict.accept = !targetConflict.accept;
    this.setState(({ conflictAnalysis }) => ({
      conflictAnalysis: [
        ...conflictAnalysis.slice(0, index),
        targetConflict,
        ...conflictAnalysis.slice(index + 1),
      ],
    }));
  }

  render() {
    const { t } = this.props;
    return (
      <UI.Modal
        titleAriaId={`merge-conflict-solver`}
        isOpen={true}
        onDismiss={this.props.onAbort}
        allowTouchBodyScroll={true}
        isBlocking={false}
      >
        <div className={contentStyles.header}>
          <span id={`merge-conflict-solver`}>
            <Intl.Trans ns="translation" i18nKey="title.diff" />
          </span>
          <UI.IconButton
            styles={iconButtonStyles}
            iconProps={{ iconName: "Cancel" }}
            ariaLabel={t("action.close")}
            onClick={this.props.onAbort}
          />
        </div>
        <div className={contentStyles.body}>
          {this.state.conflictAnalysis.map((compareResult, index) => {
            return (
              <div key={`diff-${index}`} className={contentStyles.entry}>
                <UI.Stack horizontal>
                  <h1 className={contentStyles.entryTitle}>
                    {compareResult.file}
                  </h1>
                  <UI.Toggle
                    label="Accept changes"
                    inlineLabel
                    checked={compareResult.accept}
                    onChange={() => this.toggleAccept(index)}
                  />
                </UI.Stack>
                {compareResult.type === "binary" ? (
                  <p>Binary file</p>
                ) : (
                  <pre>
                    <code>{compareResult.content}</code>
                  </pre>
                )}
              </div>
            );
          })}
        </div>
        <div className={contentStyles.footer}>
          <UI.PrimaryButton
            onClick={() => this.props.onResolve(this.state.conflictAnalysis)}
          >
            <Intl.Trans ns="translation" i18nKey="merge.accept" />
          </UI.PrimaryButton>
        </div>
      </UI.Modal>
    );
  }
}

export default Intl.withTranslation("translation")(MergeConflict);

const theme = UI.getTheme();
const contentStyles = UI.mergeStyleSets({
  container: {
    display: "flex",
    flexFlow: "column nowrap",
    alignItems: "stretch",
    overflowY: "hidden",
  },
  header: [
    theme.fonts.xLargePlus,
    {
      flex: "1 1 auto",
      display: "flex",
      alignItems: "center",
      fontWeight: UI.FontWeights.semibold,
      padding: "12px 12px 14px 24px",
    },
  ],
  body: {
    flex: "4 4 auto",
    overflowY: "hidden",
    padding: "12px 12px 14px 24px",
  },
  footer: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "12px 12px 14px 24px",
  },
  entry: {
    boxShadow:
      "0 3.2px 7.2px 0 rgba(0,0,0,.132), 0 0.6px 1.8px 0 rgba(0,0,0,.108)",
    padding: "12px 12px 14px 24px",
  },
  entryTitle: [
    theme.fonts.large,
    {
      fontWeight: UI.FontWeights.bold,
      verticalAlign: "center",
      alignSelf: "center",
      marginRight: "24px",
    },
  ],
});
const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: "auto",
  },
};

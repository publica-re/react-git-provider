import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";
import DiffViewer, { DiffMethod } from "react-diff-viewer";

import Git, { GitComponentState } from "react-git-provider";

import "../../theme";

import { Utils } from "..";

export interface DiffProps {
  left: string;
  right: string;
  onClose: () => void;
}

type TrueDiffMethod = DiffMethod | "diffJson";

export interface DiffState {
  compareMethod: { [index: number]: TrueDiffMethod };
  messages: string[];
}

class Diff extends Git.Component<DiffProps & Intl.WithTranslation, DiffState> {
  static contextType = Git.Context;

  constructor(props: DiffProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      compareMethod: {},
      messages: [],
      gitWatch: {
        directory: {
          compare: {
            left: props.left,
            right: props.right,
          },
        },
      },
    };
  }

  async componentDidUpdate(
    prevProps: DiffProps & Intl.WithTranslation,
    prevState: DiffState & GitComponentState
  ) {
    super.componentDidUpdate(prevProps, prevState);
    if (
      prevProps.left !== this.props.left ||
      prevProps.right !== this.props.right
    ) {
      this.setState(({ gitWatch }) => ({
        gitWatch: {
          ...gitWatch,
          directory: {
            ...gitWatch.directory,
            compare: {
              left: this.props.left,
              right: this.props.right,
            },
          },
        },
      }));
    }
  }

  @bind
  private diffOptions() {
    const { t } = this.props;
    return [
      {
        key: DiffMethod.CHARS,
        text: t("diff.chars"),
        iconProps: { iconName: "PlainText" },
      },
      {
        key: DiffMethod.WORDS,
        text: t("diff.words"),
        iconProps: { iconName: "TextField" },
      },
      {
        key: DiffMethod.WORDS_WITH_SPACE,
        text: t("diff.words-space"),
        iconProps: { iconName: "TextBox" },
      },
      {
        key: DiffMethod.SENTENCES,
        text: t("diff.sentences"),
        iconProps: { iconName: "IncreaseIndentText" },
      },
      {
        key: DiffMethod.LINES,
        text: t("diff.lines"),
        iconProps: { iconName: "SortLines" },
      },
      {
        key: DiffMethod.TRIMMED_LINES,
        text: t("diff.trimmed-lines"),
        iconProps: { iconName: "LineStyle" },
      },
      {
        key: DiffMethod.CSS,
        text: t("diff.css"),
        iconProps: { iconName: "BarChartVerticalEdit" },
      },
    ] as UI.IChoiceGroupOption[];
  }

  render() {
    const { t } = this.props;
    const { directory } = this.state.gitValues;
    if (directory?.compare === undefined)
      return <Utils.Loader message={this.state.messages[0]} />;
    const status = directory?.compare;
    return (
      <UI.Modal
        titleAriaId={`diff-${this.props.left}-${this.props.right}`}
        isOpen={true}
        onDismiss={this.props.onClose}
        allowTouchBodyScroll={true}
        isBlocking={false}
      >
        <div className={contentStyles.header}>
          <span id={`diff-${this.props.left}-${this.props.right}`}>
            <Intl.Trans ns="translation" i18nKey="title.diff" />
          </span>
          <UI.IconButton
            styles={iconButtonStyles}
            iconProps={{ iconName: "Cancel" }}
            ariaLabel={t("action.close")}
            onClick={this.props.onClose}
          />
        </div>
        <div className={contentStyles.body}>
          {Object.entries(status).map(
            ([path, compareResult]: [string, any], index) => {
              if (compareResult.type === "unchanged") return null;
              return (
                <UI.Stack key={`diff-${index}`}>
                  <DiffViewer
                    leftTitle={path}
                    rightTitle={t(`diff.${compareResult.type}`)}
                    compareMethod={
                      this.state.compareMethod[index] as DiffMethod
                    }
                    oldValue={
                      compareResult.leftIsBinary
                        ? "Binary file"
                        : compareResult.leftContent
                    }
                    newValue={
                      compareResult.rightIsBinary
                        ? "Binary file"
                        : compareResult.rightContent
                    }
                    splitView={true}
                  />
                  <UI.ChoiceGroup
                    label={t("diff.mode")}
                    selectedKey={
                      this.state.compareMethod[index] || DiffMethod.CHARS
                    }
                    onChange={(
                      _event?: React.FormEvent,
                      option?: UI.IChoiceGroupOption
                    ) =>
                      option?.key &&
                      this.setState(({ compareMethod }) => ({
                        compareMethod: {
                          ...compareMethod,
                          [index]: option.key as TrueDiffMethod,
                        },
                      }))
                    }
                    options={this.diffOptions()}
                  />
                  <UI.Separator />
                </UI.Stack>
              );
            }
          )}
        </div>
      </UI.Modal>
    );
  }
}

export default Intl.withTranslation("translation")(Diff);

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
});
const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: "auto",
  },
};

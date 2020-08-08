import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation, Trans } from "react-i18next";
import DiffViewer, { DiffMethod } from "react-diff-viewer";

import Git, { GitBakers, CompareStatus } from "react-git-provider";
import {
  Stack,
  Modal,
  IconButton,
  getTheme,
  mergeStyleSets,
  FontWeights,
  ChoiceGroup,
  IChoiceGroupOption,
  Separator,
} from "@fluentui/react";
import "../../theme";

import { Utils } from "..";

export interface DiffProps {
  left: string;
  right: string;
  onClose: () => void;
}

type TrueDiffMethod = DiffMethod | "diffJson";

export interface DiffState {
  status?: {
    [path: string]: CompareStatus;
  };
  compareMethod: { [index: number]: TrueDiffMethod };
  messages: string[];
}

class Diff extends React.Component<DiffProps & WithTranslation, DiffState> {
  static contextType = Git.Context;

  constructor(props: DiffProps & WithTranslation) {
    super(props);

    this.state = {
      status: undefined,
      compareMethod: {},
      messages: [],
    };
  }

  async componentDidUpdate(prevProps: DiffProps) {
    if (
      prevProps.left !== this.props.left ||
      prevProps.right !== this.props.right
    ) {
      await this.makeDiff();
    }
  }

  async componentDidMount() {
    await this.makeDiff();
  }

  @bind
  async makeDiff() {
    const { directoryCompare } = this.context.bakers as GitBakers;
    let left = this.props.left;
    let right = this.props.right;
    const compare = await directoryCompare({ left: left, right: right });
    this.setState({
      status: compare,
    });
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
    ] as IChoiceGroupOption[];
  }

  render() {
    const { t } = this.props;
    return (
      <Modal
        titleAriaId={`diff-${this.props.left}-${this.props.right}`}
        isOpen={true}
        onDismiss={this.props.onClose}
        allowTouchBodyScroll={true}
        isBlocking={false}
      >
        <div className={contentStyles.header}>
          <span id={`diff-${this.props.left}-${this.props.right}`}>
            <Trans ns="translation" i18nKey="title.diff" />
          </span>
          <IconButton
            styles={iconButtonStyles}
            iconProps={{ iconName: "Cancel" }}
            ariaLabel={t("action.close")}
            onClick={this.props.onClose}
          />
        </div>
        <div className={contentStyles.body}>
          {(this.state.status &&
            Object.entries(this.state.status).map(
              ([path, compareResult]: [string, any], index) => {
                if (compareResult.type === "unchanged") return null;
                return (
                  <Stack key={`diff-${index}`}>
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
                    <ChoiceGroup
                      label={t("diff.mode")}
                      selectedKey={
                        this.state.compareMethod[index] || DiffMethod.CHARS
                      }
                      onChange={(
                        _event?: React.FormEvent,
                        option?: IChoiceGroupOption
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
                    <Separator />
                  </Stack>
                );
              }
            )) || <Utils.Loader message={this.state.messages[0]} />}
        </div>
      </Modal>
    );
  }
}

export default withTranslation("translation")(Diff);

const theme = getTheme();
const contentStyles = mergeStyleSets({
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
      fontWeight: FontWeights.semibold,
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

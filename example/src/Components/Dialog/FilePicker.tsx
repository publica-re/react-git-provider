import * as React from "react";
import bind from "bind-decorator";
import pathUtils from "path";

import { WithTranslation, withTranslation, Trans } from "react-i18next";
import {
  IconButton,
  getTheme,
  ComboBox,
  DetailsList,
  Stack,
  DefaultButton,
  PrimaryButton,
  SelectionMode,
  Icon,
  DetailsRow,
  IDetailsRowProps,
  Dialog,
  DialogFooter,
  DialogContent,
} from "@fluentui/react";
import "../../theme";

import Git, {
  GitValues,
  GitBakers,
  FileStatus,
  GitStatus,
} from "react-git-provider";
import { Utils } from "..";

export interface FilePickerProps {
  pickType?: "file" | "dir";
  children?: React.ReactNode;
  isVisible: boolean;
  onChoose: (path: string) => void;
  onAbort: () => void;
}

export interface FilePickerState {
  currentPath: string;
  selectedFile?: string;
}

class FilePicker extends React.Component<
  FilePickerProps & WithTranslation,
  FilePickerState
> {
  static contextType = Git.Context;

  public static defaultProps = {
    pickType: "file" as "file",
  };

  constructor(props: FilePickerProps & WithTranslation) {
    super(props);

    this.state = {
      currentPath: "/",
      selectedFile: undefined,
    };
  }

  async componentDidMount() {
    const { directoryStatus, directoryRead } = this.context.bakers as GitBakers;
    await directoryStatus({});
    await directoryRead({ path: "/" });
  }

  @bind
  renderRow(props?: IDetailsRowProps) {
    if (props) {
      return (
        <div onDoubleClick={this.doChoose}>
          <DetailsRow {...props} indentWidth={0} />
        </div>
      );
    }
    return null;
  }

  @bind
  makeItems(items: { [path: string]: FileStatus }, directories: string[]) {
    const { t } = this.props;
    const paths = [...directories, ...Object.keys(items)];
    return paths
      .filter(
        (path) =>
          pathUtils.dirname(path) === this.state.currentPath &&
          path !== this.state.currentPath
      )
      .map((path) => ({
        filetype:
          items[path] !== undefined ? (
            <Icon iconName="TextDocument" />
          ) : (
            <Icon iconName="FabricFolder" />
          ),
        path: path,
        status:
          (items[path]?.status !== undefined &&
            Utils.functions.gitStatusToIcon(items[path]?.status as GitStatus)
              ?.title) ||
          t("type.directory"),
      }));
  }

  @bind
  doChoose() {
    const { fileStatusTree } = this.context.values as GitValues;
    if (this.props.pickType === "file") {
      if (this.state.selectedFile) {
        if (fileStatusTree[this.state.selectedFile] !== undefined) {
          this.props.onChoose(this.state.selectedFile);
        } else {
          this.setState({
            currentPath: this.state.selectedFile,
            selectedFile: "",
          });
        }
      }
    } else if (this.props.pickType === "dir") {
      if (
        !this.state.selectedFile ||
        fileStatusTree[this.state.selectedFile] !== undefined
      ) {
        this.props.onChoose(this.state.currentPath);
      } else {
        this.setState({
          currentPath: this.state.selectedFile,
          selectedFile: "",
        });
      }
    }
  }

  render() {
    const { fileStatusTree, fileTree } = this.context.values as GitValues;
    const { t } = this.props;

    return (
      <Dialog
        hidden={!this.props.isVisible}
        modalProps={{
          isBlocking: false,
        }}
        dialogContentProps={{
          title:
            this.props.pickType === "dir"
              ? t("title.dialog-pick")
              : t("title.file-pick"),
        }}
        onDismiss={this.props.onAbort}
        minWidth={720}
      >
        <DialogContent>
          <Stack horizontal>
            <ComboBox
              selectedKey={this.state.currentPath}
              autoComplete={"on"}
              allowFreeform={false}
              onChange={(_event, option) =>
                option?.key &&
                this.setState({ currentPath: option?.key.toString() })
              }
              options={Utils.functions.getAllDirs(fileTree).map((path) => ({
                key: path,
                text: path,
              }))}
            />
            <IconButton
              styles={iconButtonStyles}
              iconProps={{ iconName: "DoubleChevronUp" }}
              ariaLabel={t("action.top")}
              onClick={() =>
                this.setState({
                  currentPath: pathUtils.dirname(this.state.currentPath),
                })
              }
            />
          </Stack>
          <DetailsList
            items={this.makeItems(
              fileStatusTree,
              Utils.functions.getAllDirs(fileTree)
            )}
            selectionMode={SelectionMode.single}
            onRenderRow={this.renderRow}
            onActiveItemChanged={(item) => {
              this.setState({ selectedFile: item.path });
            }}
            columns={[
              {
                key: "filetype",
                fieldName: "filetype",
                name: "File type",
                minWidth: 50,
              },
              { key: "path", fieldName: "path", name: "Path", minWidth: 300 },
              {
                key: "status",
                fieldName: "status",
                name: "Status",
                minWidth: 50,
              },
            ]}
          />
        </DialogContent>
        <DialogFooter>
          <DefaultButton onClick={this.props.onAbort}>
            <Trans ns="translation" i18nKey="dialog.cancel" />
          </DefaultButton>
          <PrimaryButton
            disabled={
              this.state.selectedFile === undefined &&
              this.props.pickType === "file"
            }
            onClick={this.doChoose}
          >
            <Trans ns="translation" i18nKey="dialog.choose" />
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    );
  }
}

export default withTranslation("translation")(FilePicker);

const theme = getTheme();
const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: "auto",
  },
};

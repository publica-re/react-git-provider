import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";
import pathUtils from "path";

import "../../theme";

import Git from "react-git-provider";
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

export const filePickerColumns = [
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
];
class FilePicker extends Git.Component<
  FilePickerProps & Intl.WithTranslation,
  FilePickerState
> {
  public static defaultProps = {
    pickType: "file" as "file",
  };

  constructor(props: FilePickerProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      currentPath: "/",
      selectedFile: undefined,
      gitWatch: {
        directory: {
          read: { path: "/" },
          status: {},
        },
      },
    };
  }

  @bind
  prepareObjects(): FilePickerColumns[] {
    const { currentPath } = this.state;
    const { t } = this.props;
    const { directory } = this.state.gitValues;
    if (directory?.read === undefined || directory?.status === undefined)
      return [];
    const directories = Utils.functions.getAllDirs(directory.read);
    const files = directory.status;
    const paths = [...directories, ...Object.keys(files)];
    return paths.reduce((objects: FilePickerColumns[], path: string) => {
      if (pathUtils.dirname(path) !== currentPath || path === currentPath)
        return objects;
      const fileStatus = files[path];
      const icon = fileStatus ? "TextDocument" : "FabricFolder";
      const { title: status } = fileStatus?.status
        ? Utils.functions.gitStatusToIcon(fileStatus.status)
        : {
            title: t("type.directory"),
          };
      return [
        ...objects,
        {
          filetype: <UI.Icon iconName={icon} />,
          path: path,
          status: status,
        },
      ];
    }, []);
  }

  @bind
  selectFile(path?: string) {
    this.setState({ selectedFile: path });
  }

  @bind
  changeDirectory(path: string) {
    this.setState({ currentPath: path });
  }

  @bind
  doChoose() {
    const { directory } = this.state.gitValues;
    if (directory?.read === undefined || directory?.status === undefined)
      return [];
    const { pickType, onChoose: choose } = this.props;
    const { selectedFile } = this.state;
    if (pickType === "file" && selectedFile) {
      // if it is a file
      if (directory.status[selectedFile] !== undefined) {
        return choose(selectedFile);
      }
      // if it is a directory
      this.changeDirectory(selectedFile);
      this.selectFile();
    } else if (pickType === "dir") {
      // if no file is selected
      if (selectedFile === undefined) {
        return choose(this.state.currentPath);
      }
      this.changeDirectory(selectedFile);
      this.selectFile();
    }
  }

  @bind
  renderRow(props?: UI.IDetailsRowProps) {
    if (props) {
      return (
        <div onDoubleClick={this.doChoose}>
          <UI.DetailsRow {...props} indentWidth={0} />
        </div>
      );
    }
    return null;
  }

  render() {
    const { t, isVisible, pickType, onAbort } = this.props;
    const { currentPath } = this.state;
    const { directory } = this.state.gitValues;
    if (directory?.read === undefined || directory?.status === undefined)
      return [];
    const directories = Utils.functions.getAllDirs(directory.read);
    const renderedDirectories = directories.map((path) => ({
      key: path,
      text: path,
    }));
    const title =
      pickType === "dir" ? t("title.dialog-pick") : t("title.file-pick");
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
        minWidth={720}
      >
        <UI.DialogContent>
          <UI.Stack horizontal>
            <UI.ComboBox
              selectedKey={currentPath}
              autoComplete={"on"}
              allowFreeform={false}
              onChange={(_event, option) => {
                option?.key && this.changeDirectory(option.key.toString());
              }}
              options={renderedDirectories}
            />
            <UI.IconButton
              styles={iconButtonStyles}
              iconProps={{ iconName: "DoubleChevronUp" }}
              ariaLabel={t("action.top")}
              onClick={() =>
                this.setState({
                  currentPath: pathUtils.dirname(this.state.currentPath),
                })
              }
            />
          </UI.Stack>
          <UI.DetailsList
            items={this.prepareObjects()}
            selectionMode={UI.SelectionMode.single}
            onRenderRow={this.renderRow}
            onActiveItemChanged={(item) => this.selectFile(item.path)}
            columns={filePickerColumns}
          />
        </UI.DialogContent>
        <UI.DialogFooter>
          <UI.DefaultButton onClick={this.props.onAbort}>
            <Intl.Trans ns="translation" i18nKey="dialog.cancel" />
          </UI.DefaultButton>
          <UI.PrimaryButton
            disabled={
              this.state.selectedFile === undefined &&
              this.props.pickType === "file"
            }
            onClick={this.doChoose}
          >
            <Intl.Trans ns="translation" i18nKey="dialog.choose" />
          </UI.PrimaryButton>
        </UI.DialogFooter>
      </UI.Dialog>
    );
  }
}

export default Intl.withTranslation("translation")(FilePicker);

interface FilePickerColumns {
  filetype: React.ReactNode;
  path: string;
  status: string;
}

const theme = UI.getTheme();
const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: "auto",
  },
};

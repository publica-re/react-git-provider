import * as React from "react";

import { WithTranslation, withTranslation, Trans } from "react-i18next";
import { Modal, ContextualMenu, IconButton } from "@fluentui/react";
import { useId } from "@uifabric/react-hooks";

import Git from "react-git-provider";

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

  render() {
    const titleId = useId();
    return (
      <Modal
        titleAriaId={titleId}
        isOpen={this.props.isVisible}
        onDismiss={this.props.onAbort}
        isBlocking={false}
        dragOptions={{
          moveMenuItemText: "Move",
          closeMenuItemText: "Close",
          menu: ContextualMenu,
        }}
      >
        <div>
          <span id={titleId}>
            {this.props.pickType === "dir" ? (
              <Trans ns="translation" i18nKey="title.directory-pick" />
            ) : (
              <Trans ns="translation" i18nKey="title.file-pick" />
            )}
          </span>
          <IconButton
            iconProps={{ iconName: "Cancel" }}
            ariaLabel="Close popup modal"
            onClick={this.props.onAbort}
          />
        </div>
        <div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            lorem nulla, malesuada ut sagittis sit amet, vulputate in leo.
            Maecenas vulputate congue sapien eu tincidunt. Etiam eu sem turpis.
            Fusce tempor sagittis nunc, ut interdum ipsum vestibulum non. Proin
            dolor elit, aliquam eget tincidunt non, vestibulum ut turpis. In hac
            habitasse platea dictumst. In a odio eget enim porttitor maximus.
            Aliquam nulla nibh, ullamcorper aliquam placerat eu, viverra et dui.
            Phasellus ex lectus, maximus in mollis ac, luctus vel eros. Vivamus
            ultrices, turpis sed malesuada gravida, eros ipsum venenatis elit,
            et volutpat eros dui et ante. Quisque ultricies mi nec leo ultricies
            mollis. Vivamus egestas volutpat lacinia. Quisque pharetra eleifend
            efficitur.
          </p>
          <p>
            Mauris at nunc eget lectus lobortis facilisis et eget magna.
            Vestibulum venenatis augue sapien, rhoncus faucibus magna semper
            eget. Proin rutrum libero sagittis sapien aliquet auctor.
            Suspendisse tristique a magna at facilisis. Duis rhoncus feugiat
            magna in rutrum. Suspendisse semper, dolor et vestibulum lacinia,
            nunc felis malesuada ex, nec hendrerit justo ex et massa. Quisque
            quis mollis nulla. Nam commodo est ornare, rhoncus odio eu, pharetra
            tellus. Nunc sed velit mi.
          </p>
          <p>
            Sed condimentum ultricies turpis convallis pharetra. Sed sagittis
            quam pharetra luctus porttitor. Cras vel consequat lectus. Sed nec
            fringilla urna, a aliquet libero. Aenean sed nisl purus. Vivamus
            vulputate felis et odio efficitur suscipit. Ut volutpat dictum
            lectus, ac rutrum massa accumsan at. Sed pharetra auctor finibus. In
            augue libero, commodo vitae nisi non, sagittis convallis ante.
            Phasellus malesuada eleifend mollis. Curabitur ultricies leo ac
            metus venenatis elementum.
          </p>
          <p>
            Aenean egestas quam ut erat commodo blandit. Mauris ante nisl,
            pellentesque sed venenatis nec, aliquet sit amet enim. Praesent
            vitae diam non diam aliquet tristique non ut arcu. Pellentesque et
            ultrices eros. Fusce diam metus, mattis eu luctus nec, facilisis vel
            erat. Nam a lacus quis tellus gravida euismod. Nulla sed sem eget
            tortor cursus interdum. Sed vehicula tristique ultricies. Aenean
            libero purus, mollis quis massa quis, eleifend dictum massa. Fusce
            eu sapien sit amet odio lacinia placerat. Mauris varius risus sed
            aliquet cursus. Aenean lectus magna, tincidunt sit amet sodales a,
            volutpat ac leo. Morbi nisl sapien, tincidunt sit amet mauris quis,
            sollicitudin auctor est.
          </p>
          <p>
            Nam id mi justo. Nam vehicula vulputate augue, ac pretium enim
            rutrum ultricies. Sed aliquet accumsan varius. Quisque ac auctor
            ligula. Fusce fringilla, odio et dignissim iaculis, est lacus
            ultrices risus, vitae condimentum enim urna eu nunc. In risus est,
            mattis non suscipit at, mattis ut ante. Maecenas consectetur urna
            vel erat maximus, non molestie massa consequat. Duis a feugiat nibh.
            Sed a hendrerit diam, a mattis est. In augue dolor, faucibus vel
            metus at, convallis rhoncus dui.
          </p>
        </div>
      </Modal>
    );
  }
}

export default withTranslation("translation")(FilePicker);

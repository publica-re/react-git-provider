import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";

import Git from "react-git-provider";

import "../../theme";

export interface RemoteProps {}

export interface RemoteState {}

class Remote extends Git.Component<
  RemoteProps & Intl.WithTranslation,
  RemoteState
> {
  constructor(props: RemoteProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      gitWatch: {
        remote: {
          list: {},
        },
      },
    };
  }

  render() {
    const { remote } = this.state.gitValues;
    if (remote?.list === undefined) return null;
    return (
      <UI.Stack>
        {remote.list.map(({ remote, url }: { remote: string; url: string }) => (
          <UI.Stack horizontal tokens={{ childrenGap: 15 }}>
            <UI.TextField label="Name" defaultValue={remote} />
            <UI.TextField label="Adress" defaultValue={url} />
          </UI.Stack>
        ))}
      </UI.Stack>
    );
  }
}

export default Intl.withTranslation("translation")(Remote);

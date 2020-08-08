import * as React from "react";

import { withTranslation, WithTranslation } from "react-i18next";
import { Stack, TextField } from "@fluentui/react";
import "../../theme";

import Git, { GitBakers } from "react-git-provider";

export interface RemoteProps {}

export interface RemoteState {}

class Remote extends React.Component<
  RemoteProps & WithTranslation,
  RemoteState
> {
  static contextType = Git.Context;

  async componentDidMount() {
    const { remoteList } = this.context.bakers as GitBakers;
    await remoteList({});
  }

  render() {
    return (
      <Stack>
        {this.context.values.remoteList.map(
          ({ remote, url }: { remote: string; url: string }) => (
            <Stack horizontal tokens={{ childrenGap: 15 }}>
              <TextField label="Name" defaultValue={remote} />
              <TextField label="Adress" defaultValue={url} />
            </Stack>
          )
        )}
      </Stack>
    );
  }
}

export default withTranslation("translation")(Remote);

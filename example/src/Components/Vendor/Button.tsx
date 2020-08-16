import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";
import bind from "bind-decorator";

import Git from "react-git-provider";

import "../../theme";
import * as API from "../../API";

export interface ButtonProps {}

export interface ButtonState {
  currentUser?: API.APIProfile;
  api?: API.Abstract;
}

class Button extends Git.Component<
  ButtonProps & Intl.WithTranslation,
  ButtonState
> {
  constructor(props: ButtonProps & Intl.WithTranslation) {
    super(props);

    this.state = {
      ...this.state,
      api: undefined,
    };
  }

  @bind
  async componentDidMount() {
    super.componentDidMount();
    const { getAuth, url } = this.context.internal;
    const auth = await getAuth("", {});
    if (auth.username === "oauth2" && auth.password) {
      // Gitlab
      const api = new API.Gitlab(auth.password, url);
      this.setState({
        api: api,
      });
      const currentUser = await api.userProfile();
      if (currentUser) {
        this.setState({
          currentUser: currentUser,
        });
      }
    }
  }

  @bind
  async openVendor() {
    window.open((await this.state.api?.website()) || "/", "_blank");
  }

  render() {
    return (
      <UI.Stack horizontal>
        <span onClick={this.openVendor} className={clickableSpan}>
          <UI.Persona
            imageUrl={this.state.currentUser?.avatarUrl}
            size={UI.PersonaSize.size32}
          />
        </span>
      </UI.Stack>
    );
  }
}

export default Intl.withTranslation("translation")(Button);

const clickableSpan = UI.mergeStyles([
  {
    cursor: "pointer",
  },
]);

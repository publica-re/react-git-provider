import * as React from "react";
import * as Intl from "react-i18next";
import * as UI from "@fluentui/react";

import { GitAuth } from "isomorphic-git";
import bind from "bind-decorator";

import Git from "react-git-provider";

import * as API from "../../API";
import "../../theme";

export interface AuthProps {
  url: string;
  auth: GitAuth;
  onLoginAttempt: (auth: GitAuth) => void;
  behaviour?: "gitlab";
}

export interface AuthState {
  username: string;
  password: string;
  doRemember: boolean;
}

class Auth extends Git.Component<AuthProps & Intl.WithTranslation, AuthState> {
  constructor(props: AuthProps & Intl.WithTranslation) {
    super(props);

    const retrieveSaved = (name: string) =>
      localStorage.getItem(`git-${name}`) || "";

    this.state = {
      ...this.state,
      doRemember: false,
      username: retrieveSaved("username"),
      password: retrieveSaved("password"),
    };
  }

  async componentDidMount() {
    super.componentDidMount();
    if (this.props.behaviour === undefined) {
      this.state.username !== "" &&
        this.state.password !== "" &&
        this.handleLoginAttempt();
    } else if (this.props.behaviour === "gitlab") {
      await this.doGitlabAuth();
    }
  }

  @bind
  async doGitlabAuth() {
    const authResult = await API.Gitlab.auth(this.props.url);
    if (authResult !== false) {
      this.props.onLoginAttempt(authResult);
    } else {
      return;
    }
  }

  @bind
  handleLoginAttempt() {
    this.props.onLoginAttempt({
      ...this.props.auth,
      username: this.state.username,
      password: this.state.password,
    });
    if (this.state.doRemember) {
      localStorage.setItem(`git-username`, this.state.username || "");
      localStorage.setItem(`git-password`, this.state.password || "");
    }
  }

  @bind
  setLogin(
    username = this.state.username,
    password = this.state.password,
    doRemember = this.state.doRemember
  ) {
    this.setState({ username, password, doRemember });
  }

  render() {
    const { t } = this.props;
    if (this.props.behaviour === "gitlab") return null;
    return (
      <UI.Layer>
        <UI.Overlay styles={overlayStyle}>
          <form onSubmit={this.handleLoginAttempt}>
            <UI.Stack className={contentClass} tokens={{ childrenGap: 15 }}>
              <UI.TextField
                label={t("auth.username")}
                onChange={(_event: React.FormEvent, newValue?: string) =>
                  this.setLogin(newValue)
                }
                value={this.state.username}
              />
              <UI.TextField
                label={t("auth.password")}
                type="password"
                onChange={(_event: React.FormEvent, newValue?: string) =>
                  this.setLogin(undefined, newValue)
                }
                value={this.state.password}
              />
              <UI.Checkbox
                label={t("auth.rememberCredentials")}
                checked={this.state.doRemember}
                onChange={(_event?: React.FormEvent, checked?: boolean) =>
                  this.setLogin(undefined, undefined, checked)
                }
                defaultChecked={this.state.doRemember}
              />
              {this.state.doRemember ? (
                <UI.MessageBar messageBarType={UI.MessageBarType.severeWarning}>
                  <Intl.Trans
                    ns="common"
                    i18nKey="auth.rememberCredentialsWarning"
                  />
                </UI.MessageBar>
              ) : null}
              <UI.PrimaryButton
                text={t("auth.login")}
                onClick={this.handleLoginAttempt}
                role="submit"
              />
            </UI.Stack>
          </form>
        </UI.Overlay>
      </UI.Layer>
    );
  }
}

export default Intl.withTranslation("translation")(Auth);

const theme = UI.getTheme();
const overlayStyle: UI.IOverlayStyles = {
  root: {
    backgroundColor: theme.palette.blackTranslucent40,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const contentClass = UI.mergeStyles([
  {
    backgroundColor: theme.palette.white,
    color: theme.palette.blackTranslucent40,
    width: "50vw",
    padding: "50px",
  },
]);

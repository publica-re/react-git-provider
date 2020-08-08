import * as React from "react";
import bind from "bind-decorator";

import { withTranslation, WithTranslation, Trans } from "react-i18next";
import {
  Overlay,
  IOverlayStyles,
  TextField,
  Stack,
  getTheme,
  mergeStyles,
  Checkbox,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Layer,
} from "@fluentui/react";
import { GitAuth } from "isomorphic-git";
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

const theme = getTheme();
const overlayStyle: IOverlayStyles = {
  root: {
    backgroundColor: theme.palette.blackTranslucent40,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const contentClass = mergeStyles([
  {
    backgroundColor: theme.palette.white,
    color: theme.palette.blackTranslucent40,
    width: "50vw",
    padding: "50px",
  },
]);

class Auth extends React.Component<AuthProps & WithTranslation, AuthState> {
  constructor(props: AuthProps & WithTranslation) {
    super(props);

    this.state = {
      doRemember: false,
      username: localStorage.getItem(`git-username`) || "",
      password: localStorage.getItem(`git-password`) || "",
    };
  }

  componentDidMount() {
    if (this.props.behaviour === undefined) {
      this.state.username !== "" &&
        this.state.password !== "" &&
        this.handleLoginAttempt();
    } else if (this.props.behaviour === "gitlab") {
      this.doGitlabAuth();
    }
  }

  @bind
  doGitlabAuth() {
    const authorizePath = "/oauth/authorize";
    const targetUrl = new URL(authorizePath, this.props.url);
    targetUrl.searchParams.set(
      "client_id",
      "f585b157feb0bcffaddd5b885f369593898f31f2f6f6e42c8db7390e7f1321f1"
    );
    targetUrl.searchParams.set("redirect_url", "http://localhost/");
    targetUrl.searchParams.set("state", "AUTH");
    targetUrl.searchParams.set("response_type", "code");
    targetUrl.searchParams.set(
      "scope",
      "api read_user read_repository write_repository"
    );
    console.log(targetUrl.toString());

    window.location.replace(targetUrl.toString());
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
    return (
      <Layer>
        <Overlay styles={overlayStyle}>
          <form onSubmit={this.handleLoginAttempt}>
            <Stack className={contentClass} tokens={{ childrenGap: 15 }}>
              <TextField
                label={t("auth.username")}
                onChange={(_event: React.FormEvent, newValue?: string) =>
                  this.setLogin(newValue)
                }
                value={this.state.username}
              />
              <TextField
                label={t("auth.password")}
                type="password"
                onChange={(_event: React.FormEvent, newValue?: string) =>
                  this.setLogin(undefined, newValue)
                }
                value={this.state.password}
              />
              <Checkbox
                label={t("auth.rememberCredentials")}
                checked={this.state.doRemember}
                onChange={(_event?: React.FormEvent, checked?: boolean) =>
                  this.setLogin(undefined, undefined, checked)
                }
                defaultChecked={this.state.doRemember}
              />
              {this.state.doRemember ? (
                <MessageBar messageBarType={MessageBarType.severeWarning}>
                  <Trans
                    ns="common"
                    i18nKey="auth.rememberCredentialsWarning"
                  />
                </MessageBar>
              ) : null}
              <PrimaryButton
                text={t("auth.login")}
                onClick={this.handleLoginAttempt}
                role="submit"
              />
            </Stack>
          </form>
        </Overlay>
      </Layer>
    );
  }
}

export default withTranslation("translation")(Auth);

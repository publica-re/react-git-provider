import * as React from "react";
import bind from "bind-decorator";
import { generate as generateId } from "shortid";
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
import oauth2 from "client-oauth2";

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

  async componentDidMount() {
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
    const authorizePath = "/oauth/authorize";
    localStorage.setItem("auth-state", generateId());
    const targetUrl = new URL(authorizePath, this.props.url);
    const authorizationUri = targetUrl.toString();
    const gitlab = new oauth2({
      clientId:
        "6e5b150c2977a071e9ea60d76563f7f53bfcaa40b587000b9101a771bd02b522",
      authorizationUri: authorizationUri,
      redirectUri: window.location.href,
      scopes: ["api", "read_user", "read_repository", "write_repository"],
    });
    try {
      const token = await gitlab.token.getToken(window.location.href);
      this.props.onLoginAttempt({
        username: "oauth2",
        password: token.accessToken,
      });
      window.location.hash = "";
    } catch (e) {
      window.location.assign(gitlab.token.getUri());
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

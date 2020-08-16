import Abstract from "./Abstract";
import { generate as generateId } from "shortid";
import oauth2 from "client-oauth2";
import env from "../ENV";

export default class Gitlab extends Abstract {
  static apiPath = "/api/v4";
  static tokenParam = "access_token";

  async userInfos() {
    try {
      const result = await this.fetch("user");
      return {
        name: result.name,
        email: result.email,
      };
    } catch (e) {
      return;
    }
  }

  async userProfile() {
    try {
      const result = await this.fetch("user");
      return {
        username: result.username,
        email: result.email,
        name: result.name,
        avatarUrl: result.avatar_url,
        publicUrl: result.web_url,
        websiteUrl: result.website_url,
        location: result.location,
        bio: result.bio,
        compagny: result.organization,
        created_at: result.created_at,
      };
    } catch (e) {
      return;
    }
  }

  async signOut(): Promise<undefined> {
    const url = new URL("/users/sign_out", this._path);
    window.location.assign(url.toString());
    return;
  }

  async website() {
    return new URL("/", this._path).toString();
  }

  static async auth(path: string) {
    const authorizePath = "/oauth/authorize";
    localStorage.setItem("auth-state", generateId());
    const targetUrl = new URL(authorizePath, path);
    const authorizationUri = targetUrl.toString();
    const { href: currentUrl } = window.location;
    const redirectUrl = currentUrl.replace(/#$/, "");
    const gitlab = new oauth2({
      clientId: env.GITLAB_OAUTH_KEY,
      authorizationUri: authorizationUri,
      redirectUri: redirectUrl,
      scopes: ["api", "read_user", "read_repository", "write_repository"],
    });
    try {
      const token = await gitlab.token.getToken(window.location.href);
      window.location.hash = "";
      return {
        username: "oauth2",
        password: token.accessToken,
      };
    } catch (e) {
      window.location.assign(gitlab.token.getUri());
      return false;
    }
  }
}

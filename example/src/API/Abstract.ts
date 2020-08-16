import pathUtils from "path";
import { GitAuth } from "../../../dist";

export type APIProfile = {
  username: string;
  email: string;
  name: string;
  avatarUrl: string;
  publicUrl: string;
  websiteUrl: string;
  location: string;
  bio: string;
  compagny: string;
  created_at: string;
};
export default abstract class API {
  static apiPath: string = "/api";
  static tokenParam: string = "access_token";
  constructor(protected _token: string, protected _path: string) {}

  async fetch(path: string) {
    const url = new URL(
      pathUtils.join(this.constructor["apiPath"], path),
      this._path
    );
    url.searchParams.set(this.constructor["tokenParam"], this._token);
    return await (await fetch(url.toString())).json();
  }

  abstract signOut(): Promise<undefined>;

  abstract userInfos(): Promise<{ name: string; email: string } | undefined>;

  abstract userProfile(): Promise<APIProfile | undefined>;

  abstract website(): Promise<string>;

  static async auth(_path: string): Promise<GitAuth | false> {
    return false;
  }
}

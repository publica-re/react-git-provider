import pathUtils from "path";

export default abstract class API {
  static apiPath: string = "/api";
  static tokenParam: string = "access_token";
  constructor(private _token: string, private _path: string) {}

  async fetch(path: string) {
    console.log(this._path);

    const url = new URL(
      pathUtils.join(this.constructor["apiPath"], path),
      this._path
    );
    url.searchParams.set(this.constructor["tokenParam"], this._token);
    return await (await fetch(url.toString())).json();
  }

  abstract userInfos(): Promise<{ name: string; email: string } | undefined>;
}

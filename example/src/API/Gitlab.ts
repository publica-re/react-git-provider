import Abstract from "./Abstract";

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
}

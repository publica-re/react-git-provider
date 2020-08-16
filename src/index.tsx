import Provider from "./Provider";
import Context from "./Context";
import Component from "./Component";

export type { CommitObject, ReadCommitResult, GitAuth } from "isomorphic-git";

export * from "./Queries/_types";
export * from "./Types";

export default {
  Consumer: Context.Consumer,
  Context: Context,
  Component: Component,
  Provider: Provider,
};

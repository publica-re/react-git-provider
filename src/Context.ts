import * as React from "react";
import { GitContext, defaultGitContext } from "./Types";

const Context = React.createContext<GitContext>(defaultGitContext());

export default Context;

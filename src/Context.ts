import * as React from "react";
import { GitContext, defaultGitContext } from "./Types";

/**
 * The default context
 *
 * *Important*: do not use this as a provider !
 */
const Context = React.createContext<GitContext>(defaultGitContext());

export default Context;

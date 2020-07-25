import Provider from "./Provider";
import Context from "./Context";
import * as Components from "./Components";

export default {
  Consumer: Context.Consumer,
  Context: Context,
  Provider: Provider,
  ...Components,
};

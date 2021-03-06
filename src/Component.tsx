import React from "react";
import bind from "bind-decorator";
import Context from "./Context";
import {
  GitContext,
  GitIONS,
  GitReadOptionsOptions,
  GitReadOptionsNS,
  GitReadOptionsCall,
  GitComponentState,
} from "./Types";

/**
 * A React component updates with each changes to its watchers.
 */
export default abstract class Component<T = {}, S = {}> extends React.Component<
  T,
  S & GitComponentState
> {
  static contextType = Context;

  /**
   * The Git context
   *
   * (needed to properly cast the type)
   */
  public context: GitContext = this.context as GitContext;

  /**
   * Created a React component that updates with changes on its watchers
   *
   * @internal
   */
  constructor(props: T) {
    super(props);

    this.state = {
      ...(this.state as S),

      gitWatch: {},
      gitValues: {},
      gitEmitters: [],
    };
  }

  /**
   * (internal) Updates a value when the event is triggered
   *
   * @internal
   */
  @bind
  private async gitReadValue<
    M extends GitReadOptionsNS,
    N extends GitReadOptionsCall<M>,
    O extends GitReadOptionsOptions<M, N>
  >(ns: GitIONS, call: N, options: O): Promise<() => void> {
    try {
      return async (): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = await this.context.io[ns as any][call as any](options);
        if (value.type === "success") {
          this.setState(({ gitValues }) => ({
            gitValues: {
              ...gitValues,
              [ns]: {
                ...(gitValues[ns] || {}),
                [call]: value.value,
              },
            },
          }));
        }
      };
    } catch (e) {
      throw ReferenceError(`${name} is not a valid Git listener`);
    }
  }

  /**
   * Define the listeners.
   *
   * @internal
   */
  @bind
  private async gitPrepareListeners(): Promise<void> {
    const { emitter } = this.context as GitContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emitters: { name: string; emitter: any }[] = [];
    for (const [nsName, nsValue] of Object.entries(this.state.gitWatch)) {
      if (nsValue === undefined) continue;
      for (const [callName, callOptions] of Object.entries(nsValue)) {
        const valueReader = await this.gitReadValue(
          nsName as GitReadOptionsNS,
          callName as GitReadOptionsCall<GitReadOptionsNS>,
          callOptions as GitReadOptionsOptions<
            GitReadOptionsNS,
            GitReadOptionsCall<GitReadOptionsNS>
          >
        );
        const name = `${nsName}.${callName}`;
        emitter.on(name, valueReader);
        emitters.push({ name: name, emitter: valueReader });
        await valueReader();
      }
    }
    this.setState(() => ({
      ...this.state,
      gitEmitters: emitters,
    }));
  }

  /**
   * Called immediately when a component is mounted.
   *
   * *Important*: do not forget to `super` in your component !
   */
  componentDidMount(): void {
    this.gitPrepareListeners();
  }

  /**
   * Called immediately before a component is unmounted.
   *
   * *Important*: do not forget to `super` in your component !
   */
  componentWillUnmount(): void {
    const { emitter } = this.context;
    for (const { name, emitter: emitterInstance } of this.state.gitEmitters) {
      emitter.off(name, emitterInstance);
    }
  }

  /**
   * Called immediately after a component is updated.
   *
   * *Important*: do not forget to `super` in your component !
   */
  componentDidUpdate(_prevProps: {}, prevState: GitComponentState): void {
    if (!Object.is(prevState.gitWatch, this.state.gitWatch)) {
      this.gitPrepareListeners();
    }
  }
}

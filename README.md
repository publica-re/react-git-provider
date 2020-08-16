# react-git-provider

> A Git provider for React

Note: this is a Work in progress !

## Note

This is currently a proof of concept. I do not recommend using it in a production build.

Contributions are still welcome to ship it into the wild ! 🚀

## Install

```bash
yarn add react-git-provider
```

## Usage

### Basic usage

You can import this project, and then use it as a classic provider, which is described [https://react-git-provider.publica.re/interfaces/_types_.gitcontext.html](here).

We work with Promises, so don't forget your `await`s !

### Use as a component

If you want your component to update automatically with changes (e.g. on commit, etc), we provide a `<Component />`, which you can extend and use anywhere inside a `<Provider />`, which will be automagically triggered when changes occur.

To listen for changes, you have to set the `state.gitWatch` of your component with values corresponding with the value you want to watch first, and with the options matching first. For instance, if you want to watch for the current branch and the values of `test.tsx`, you have to write:

```typescript
this.state = {
  ...this.state,
  gitWatch: {
    branch: {
      current: {},
    },
    file: {
      read: { path: "test.tsx", mode: "text" },
    },
  },
};
```

Then, in your render (or really anywhere), you'll be able to call

```typescript
this.state.gitValues.branch.current;
```

to see the desired value.

_Important_: if you want to overwrite the `componentDidMount`, `componentDidUpdate` or `componentWillUnmount`, you have to `super` them first!

### Go futher

You can take a look at the source of [react-git-taskbar](https://github.com/publica-re/react-git-taskbar/) for an example or the [documentation](https://react-git-provider.publica.re) !

## License

Copyright 2020, [David Baumgartner](https://github.com/dvbmgr).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

## Contributing

I welcome happily contributions to pull request through [GitHub](https://github.com/publica-re/react-git-provider).

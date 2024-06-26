# Attack Graphs Plugin for draw.io

![AttackGraphs Icon](attackgraphs.svg)

## Installation and User Guide

Please find the detailed documentation [here](https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/).

The browser-based version can be launched [here](https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app).

## Technical Documentation

- [Overview of the Plugin](/docs/technical/plugin.md)
- [Storage Architecture](/docs/technical/storage.md)
- [Graph Update Hooks](/docs/technical/graph.md)

## Information for draw.io Desktop users

When adding the plugin file, it is copied into `%APPDATA%\draw.io\plugins` (on Windows), `~/.config/draw.io/plugins` (on Linux), or `~/Library/Application\ Support/draw.io/plugins` (on Mac).
By updating the `attackgraphs.js` in this location, you can avoid removing and re-adding new versions of the plugin using the GUI.

## Development

This is a standard npm project using Typescript to produce a single script artifact under `dist/attackgraphs.js`.

### Required dependencies

The following dependencies must be installed on the development environment:

- npm (for building the plugin)
- Docker (for running the tests)

Docker is used to spin-up a webserver with draw.io and the attack graphs plugin installed on it.
If the tests are never executed on the development environment (which is discouraged), Docker is not necessarily needed.

### Building the plugin

Use `npm install` to download all build dependencies.
Afterward, use `npm run build` to build a production-ready version of the plugin.

If you want that [webpack](https://webpack.js.org/) builds a new artifact of the plugin every time a source file changes, use the command `npm run watch`.
This will also set the `__DEVELOPMENT__` constant to `true` which allows to dis-/enable code depending on production and development environment.
The artifacts are saved at the same location as when building the plugin using `npm run build`.

### Starting a development webserver

A development webserver can be started with the help of Docker.
Use `npm run docker` to build a Docker image first.
After you built the plugin, use `npm start` to deploy a container with the draw.io web app and plugin installed.
Then, open [http://localhost:8000](http://localhost:8000) and configure the plugin if it's not yet enabled
(Extras > Plugins... > Add... > Custom... > `plugins/attackgraphs.js` > Add > Apply > Reload).

*Note for Windows*: the npm scripts are written for bash.
However, npm uses `cmd.exe` by default.
If you have [git for windows](https://git-scm.com/download/win) installed, you can use the following command to set bash as the default shell for scripts:

```
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

### Tests

For testing the plugin, the [Playwright](https://playwright.dev/) framework is used.
Playwright is automatically installed when installing the build dependencies with `npm install`.

After installing (`npm install`) or updating (`npm update`) the build dependencies, Playwright must install some dependencies for itself as well.
This can be done by executing the following command:

```
npx playwright install --with-deps
```

To run the included Playwright tests, a webserver with draw.io installed is needed.
Start one by executing `npm start` (uses the Docker image created prior with `npm run docker`).
After the webserver started, the tests can be run using the following command:

```
npm run test
```

## Contact

Markus Heinrich – markus.heinrich@incyde.com

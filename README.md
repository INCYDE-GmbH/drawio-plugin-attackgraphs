# Attack Graphs Plugin for draw.io

![AttackGraphs Icon](attackgraphs.svg)

## Installation and User Guide

Please find the detailed documentation [here](https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/).

## Technical Documentation

- [Overview of the Plugin](/docs/technical/plugin.md)
- [Storage Architecture](/docs/technical/storage.md)
- [Graph Update Hooks](/docs/technical/graph.md)

## Development

This is a standard npm project using Typescript to produce a single script artifact under `dist/attackgraphs.js`. Use `npm install` and `npm run build` to download all dependencies and build the plugin.

To start a development web server, you need Docker installed. Use `npm run docker` to build the Docker image.
After you built the plugin via `npm run build` or `npm run watch`, use `npm start` to deploy a container with the draw.io web app and the plugin installed.

Then, open [http://localhost:8000](http://localhost:8000) and configure the plugin (Extras > Plugins... > Add... > Custom... > `plugins/attackgraphs.js` > Add > Apply > Reload).

*Note for Windows: the npm scripts are written for bash. However, npm uses `cmd.exe` by default.
If you have [git for windows](https://git-scm.com/download/win) installed, you can use the following command to set bash as the default shell for scripts:*

```
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

### draw.io Desktop

When adding the file, it is copied into `%APPDATA%\draw.io\plugins` (on Windows), `~/.config/draw.io/plugins` (on Linux), or `~/Library/Application\ Support/draw.io/plugins` (on Mac).
By updating the `attackgraphs.js` in this location, you can avoid removing and re-adding the new version using the GUI.

### Tests

The included Playwright tests can be run using the following command:

```
npx playwright test --project chrome
```

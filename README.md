# Attack Graphs Plugin for draw.io

![AttackGraphs Icon](attackgraphs.svg)

## Installation and User Guide

Please find the detailed documentation [here](https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/).

## Technical Documentation

- [Overview of the Plugin](/docs/technical/plugin.md)
- [Storage Architecture](/docs/technical/storage.md)
- [Graph Update Hooks](/docs/technical/graph.md)

## Development

This is a standard npm project using Typescript to produce a single script artifact under `dist/attackgraphs.js`.

Use `npm install` and `npm start`, to compile the plugin and start a development web server.

Then, open [http://localhost:8000](http://localhost:8000) and configure the plugin (Extras > Plugins... > Add... > Custom... > `http://localhost:8000/attackgraphs.js` > Add > Apply > Reload).

### draw.io Desktop

When adding the file, it is copied into `%APPDATA%\draw.io\plugins` (on Windows), `~/.config/draw.io/plugins` (on Linux), or `~/Library/Application\ Support/draw.io/plugins` (on Mac).
By updating the `attackgraphs.js` in this location, you can avoid removing and re-adding the new version using the GUI.

### Tests

The included Playwright tests can be run using the following command:

```
npx playwright test --project chrome
```

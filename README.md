# Attack Graphs Plugin for draw.io

## Installation instructions

You can find the very latest version of the compiled plugin by choosing the most recent CI build [from this list](https://github.com/systemslab21/drawio-plugin-attackgraphs/actions/workflows/node.js.yml?query=branch%3Amain).
Under > Artifacts, download the 'plugin' and unzip it locally.

**draw.io Desktop**

For draw.io Desktop, you can now load the .js file using the Extras > Plugins... dialog.

When adding the file, it is copied into `%APPDATA%\draw.io\plugins` (on Windows), `~/.config/draw.io/plugins` (on Linux), or `~/Library/Application\ Support/draw.io/plugins` (on Mac).
By updating the `attackgraphs.js` in this location, you can avoid removing and re-adding the new version using the GUI.

**draw.io Web**

To be able to use the plugin from a web version of draw.io, you need a local webserver (since we don't publish the plugin on the internet yet).

The local webserver needs to run under the same protocol (http/https) as draw.io itself, so the recommended solution is to start a development webserver as described below, which proxies the full draw.io application.

Alternatively, you could run a local https server with a self-signed certificate.

**AttackGraph Template**

If you want to use the default functions that come shipped with this plugin, you can use the **AttackGraph Template** to create new files already containing the default functions. To do so, you will need to navigate to File > New > From Template URL and paste the URL `http://localhost:8000/templates/AttackGraphTemplate.drawio`.

 *(This requires a webserver to serve the template file at the that URL. It is recommended to follow the instructions below to achieve this automatically.)*

## User Guide

- [Default Attributes](/docs/default_attributes.md)
- [Aggregation Functions](/docs/aggregation_functions.md)
- [Computed Attributes](/docs/computed_attributes_functions.md)
- [Function Templates](/docs/templates.md)

## Technical Documentation

- [plugin](/docs/technical/plugin.md)
- [storage](/docs/technical/storage.md)
- [graph](/docs/technical/graph.md)

## Development

This is a standard npm project using Typescript to produce a single script artifact under `dist/attackgraphs.js`.

Use `npm install` and `npm start`, to compile the plugin and start a development web server.

Then, open [http://localhost:8000](http://localhost:8000) and configure the plugin (Extras > Plugins... > Add... > Custom... > `http://localhost:8000/attackgraphs.js` > Add > Apply > Reload).

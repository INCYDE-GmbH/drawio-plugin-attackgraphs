# Changelog

## 1.1.0 - 2022-11-20

Start of this changelog, which is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This version contains several backwards compatible new features and bug fixes. The versioning of the attack graphs plugin will adhere to [Semantic Versioning](https://semver.org/) beginning with this version.

### Added

- CHANGELOG.md (this file) to keep record of future changes to the plugin
- Semantic versioning ([SemVer](https://semver.org/)) starting with this release
- Version of the plugin shown in the `Attack Graphs` menu (together with the current hash)
- Ordering of default attributes can be changed in the `Default Attributes...` dialog
- Default **aggregation function** can be set individually for every attack graph node type
- Default **computed attributes function** can be set individually for every attack graph node type
- Bubble color can be set by computed attributes functions
- Highlight incoming and outgoing edges of a selected attack graph node
- Highlight critical paths
- Progress bar showing whether background worker are still evaluating the graph
- `Set attackgraph shape` context menu item to convert selected nodes to attack graph nodes

### Fixes and Improvements

- Resizing and moving nodes is faster even in larger graphs (in the order of milliseconds)
- Default attributes are displayed in nodes in the same order as they appear in the `Default Attributes...` dialog
- Playwright tests use a Docker container with the web version of draw.io.
- Improved `npm run` scripts
- Nodes do not disappear anymore if attributes have an empty value
- AND and OR nodes are labeled by default
- Allow for non-integer edge weights

### Removed

- `Enable Sensitivity Analysis` menu item from the `Attack Graphs` menu
- Default attributes are not added to white attack step nodes when adding them from the Sidebar.

## 1.0.0 - 2022-02-07

First release of the Attack Graphs Plugin for draw.io.

### Added

- Shapes for different attack graph node types (Consequence, Attack Step, Security Measure, AND, OR)
- Icon legend listing default attributes together with their icon
- Computed attributes functions
- Aggregation functions
- Sensitivity Analysis
- Dialogs for setting the aggregation function and computed attributes function for individual attack graph nodes
- Global dialog to add, edit, and delete default attributes, aggregation functions, and computed attributes functions

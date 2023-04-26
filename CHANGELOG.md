# Changelog

## [1.3.0](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/compare/v1.2.3...v1.3.0) - 2023-04-26

### Added

- Enable definition and visualization of edge weight reductions by aggregation functions ([#104](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/104))
- Show an update dialog if a newer version of the plugin exists ([#122](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/122))
- Allow to mark attack graph nodes to not be considered for the aggregation and combuted attributes functions ([#81](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/81))

### Fixes and Improvements

- Function handles are shown only for attack graph nodes. They are also not shown for the `AttackGraphIconLegendShape`.

### Internals

- Add: Specify predefined keywords that are used for aggregation functions in the documentation

## [1.2.3](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/compare/v1.2.2...v1.2.3) - 2023-03-30

### Fixes and Improvements

- Undos sometimes did not trigger recalculations of cell values ([#109](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/109))
- Enhance recalculation of cell values ([#108](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/108))
  - Avoid recaluclating the values of cells more than once
  - Allow to specify several cells to simultaneously update within one function call
- Function handles (aggregation and computed attributes functions) are shown after resizing nodes ([#115](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/115))
- Edges were sometimes inconsistently rendered as unmarked ([#119](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/119))

### Internals

- Fix: Sensitivity analysis test cases occasionally fail ([#111](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/111))

## [1.2.2](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/compare/v1.2.1...v1.2.2) - 2023-03-20

### Fixes and Improvements

- Reconnecting nodes now triggers a recalculation of values for all affected cells ([#98](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/98))
- Duplicates are not shown anymore when resizing nodes ([#79](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/79))

## [1.2.1](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/compare/v1.2.0...v1.2.1) - 2023-01-23

### Added

- RKL template supports mitigating the impact by a security control.

### Fixes and Improvements

- The width of attack graph node batches grows depending on the width of the text displayed in it
- Opening an attack graph caused an error when using draw.io with version >= 20.6.0

## [1.2.0](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/compare/v1.1.0...v1.2.0) - 2022-11-11

### Added

- Splitting attack graphs over several pages and linking them together with link nodes
- Documentation on how to link attack graphs on different pages together

### Fixes and Improvements

- Exporting attack graphs to PNG does not cut off attack graph nodes anymore 
- Changed computed attributes batch from a bubble to a square
- Made default attributes, aggregation functions, and computed attributes functions available on every page of a diagram
- Sensitivity analysis can now operate on diagrams with several pages
- Update templates for new feature (splitting attack graphs over several diagram pages)

## [1.1.0](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/compare/v1.0.0...v1.1.0) - 2022-11-10

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

## [1.0.0](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/releases/tag/v1.0.0) - 2022-02-07

First release of the Attack Graphs Plugin for draw.io.

### Added

- Shapes for different attack graph node types (Consequence, Attack Step, Security Measure, AND, OR)
- Icon legend listing default attributes together with their icon
- Computed attributes functions
- Aggregation functions
- Sensitivity Analysis
- Dialogs for setting the aggregation function and computed attributes function for individual attack graph nodes
- Global dialog to add, edit, and delete default attributes, aggregation functions, and computed attributes functions

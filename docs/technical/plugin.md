# Plugin
## Menubar
This plugin adds an entry to the `Menubar` as well as a button to the `Toolbar`. There are three global actions that can be triggered from the menu:
- opening the DefaultAttributes Dialog
- opening the [aggregation function Dialog](../aggregation_functions.md)
- opening the [computed attributes function Dialog](../computed_attributes_functions.md)

## Sidebar
This plugin adds multiple new shapes to the `Sidebar` under the `AttackGraph` category. By default there exist four shapes:

- one consequence shape
- three activity shapes (white, green & yellow)
- an [IconLegend](../default_attributes.md#Icon-Legend)

Also, there are two shapes that are dynamically added once the user defines global aggregation functions called `AND` or `OR`.

## Shapes
Shapes can now be used to aggregate values in a graph depending on other connected shapes. This way [graphs will update](graph.md) automatically according to their edges, values of cells and supplied functions. To edited the functions used for the aggregation, custom [handles](#ui) are rendered next to shapes if they are selected (*If the graph is not an attackgraph meaning no AttackGraphShape was used, this feature will not be active*).

For aggregation functions, an edge to a child cell can be annotated with an impact or [edge weight](../aggregation_functions.md#example-of-an-aggregation-function-accessing-a-child's-impact), which can be used as a parameter of the function. This can be done by typing a number when having an edge selected.

### AttackGraph cells
AttackGraph cells will render their (aggregated) attribute values inside the cell shape including an icon, if such attribute was defined in the global [default attributes dialog](default_attributes.md#Icon-Legend).

### Converting shapes to attackgraph shapes
All shapes can be used to aggregate values in a graph (update upwards), but only attackgraph shapes will render their aggregated or computed attributes. You can however convert your shapes to attackgraph shapes by selecting them and right-clicking. In the `pop-up menu` their will be an entry called `'Set default attributes for selection'` at the very bottom. *Be warned though, in draw.io edges are cells as well, so having a huge selection of 'cells' and edges will not work (there will be no entry in the pop-up menu).*

## UI

To render the custom ui for AttackGraph cells we extend the `mxVertexHandler` to our own `VertexHandler`. This allows us to listen for user clicks on vertices (cells) and render the custom ui accordingly. As the user can access two different functions per cell, two buttons are rendered on each side of	the cell. A click on said buttons will open the [aggregation function dialog](../aggregation_functions.md) and the
[computed attributes function dialog](../computed_attributes_functions.md) respectively.

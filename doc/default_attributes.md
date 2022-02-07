# Default Attributes
Users can define global default attributes that will be applied to all newly added `AttackgraphCells`. These attributes can be edited directly using the attackgraph button in the toolbar or via the entry under `Attack Graphs` in the menubar.

A default attribute must have a `name`. Duplicated names are not allowed. A default attribute must also have a `maximum value`. If no `minimum value` is supplied, the default value of `0` is assumed.

A default attribute can have an icon, which will be used to display the attribute inside cell shapes and the IconLegend. If an attribute does not have an icon, it will still be displayed with a default icon inside of cell shapes, but it will not be displayed in the legend.

By starting the attribute name with an `underscore` (eg. '_Test'), a user can stop those attributes from being rendered in the cell shapes.

## Icon Legend
The icon legend is a shape added by the plugin. It can be added just like any other shape and will display the default attributes of the graph. On updates of the default attributes, it will resize it's height to fit the attributes automatically.

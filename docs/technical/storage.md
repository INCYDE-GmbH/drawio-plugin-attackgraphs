# Storage
This plugin stores computed data and other necessary information inside the XML file of the graph.
The file consists of an `mxGraphModel` tag containing all the information about the graph. One level down is a `root` tag containing all the cells of the graph.
The first cell of each graph is the `root cell` with an `id` of 0. The second cell, which is the first layer, has the `id` 1.
Any added cell will be stored as `object`s inside the `root` tag as sibling of the `root cell` with a random `id`.

## Global data
Global plugin data is stored inside the `root cell` using `custom xml tags` for different data types. Global plugin data are the functions that can be referenced by cells as well as the default attributes.

## Local data
Local cell data is stored inside each cell using `custom xml tags` for different data types. Local cell data could be custom functions as well as the [default attributes](../default_attributes.md) and [aggregated values](../aggregation_functions.md) or [computed attribute](../computed_attributes_functions.md) values.

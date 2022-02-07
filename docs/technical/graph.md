# Graph Updates
There are serveral events that trigger an update of the graph or parts of the graph. Most of the events this plugin listens for are `mxEvents`, namely `mxEvent.CHANGE`, `mxEvent.CELLS_REMOVED`, `mxEvent.CELLS_ADDED` and `mxEvent.ROOT`. Other events are triggered when the user applies a global dialog and therewith changes settings that could affect the whole graph.

## Trigger events
### partly update

- cell value changed
- new cell added (*without edges only the computed attributes function is evaluated*)
- new cell connected
- cell edge removed
- cell edge added
- cell edge changed
- cell edge-weight changed

### whole graph update

- cell removed
- global ( [aggregation function](../aggregation_functions.md), [computed attributes function](../computed_attributes_functions.md), default attributes) dialog applied

## Calculations
During an update of parts of the graph, cell values will be recalculated from leafs to the roots of a graph. The recalculation consists of the execution of the [aggregation function](../aggregation_functions.md) of the cell, followed by the execution of the [computed attributes function](../computed_attributes_functions.md) of the cell. After the recalculation is done, `mxGraph.refresh()` is triggered which re-renders the graph.

Recalculated values are [stored](storage.md) in the XML file of the graph. Calculations are done asynchronously using web-workers. Inside the web-workers, functions are evaluated in a sandbox using an implementation of a [js interpreter](https://github.com/NeilFraser/JS-Interpreter) supporting ES5.



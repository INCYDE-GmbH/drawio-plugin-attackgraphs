# Computed Attributes Functions

This plugin allows to specify a computed attributes function for any shape in the diagram. The user can access the computed attributes function of a cell by clicking the [handle](technical/plugin.md#ui) displayed on the right-hand side of the cell.

![image of cell handles](images/CellHandles.png)

Computed attributes functions take attributes of the current cell and return the resulting computed attribute to the cell. There can be a `default computed attribute function`, which will be used by default by new cells. A default computed attribute function can be defined by naming a function `default` in the global **computed attribute function dialog**. If no default function was specified, cells will use the `None` function and will not calculate computed attributes.

When clicking on the *eye*-icon displayed on the lower right-hand side of the cell, the cell can be disabled and re-enabled. If the cell is disabled (slashed eye), its values are not considered by parent cells, effectively disconnecting it from its parents.

The computed attributes function dialog allows to specify a custom computed attributes function or to select a global computed attributes function by reference.

## Syntax
- A computed attributes function receives an object containing relevant values of the cell. This object is of type `CellDataCollection`. It is a collection containing a dictionary of the globally defined attributes and the local cell attributes. Local cell attributes will be overwritten in case of an aggregation function that was executed on the cell.
- A computed attributes function must return a dictionary (`KeyValuePairs`). Its `value` will be displayed as a batch in the top right corner of the cell. (***Computed attributes are only rendered for attackgraph shapes, yet all shapes store them.***)
- A computed attributes function must conform to the ES5 syntax as the computed attributes functions are executed in a [sandboxed environment](https://github.com/NeilFraser/JS-Interpreter) with it's own js interpreter.

### Expected return value
Computed attributes functions must return a dictionary (`KeyValuePairs`) containing a value for the computed attribute.
If desired, the function can further return color information to improve the presentation of batches.

The following dictionary is expected to be returned by computed attributes functions:
```ts
{
  "value": string, // Value to display in the batch (e.g. "S")
  "fillColor": string, // optional, hex color for the batch (e.g. "#ffdd00")
  "fontColor:" string // optional, hex color for the font (e.g. "#000000")
}
```
Please note that the `fillColor` and `fontColor` are optional keys.
If they are not set, they default to `#f00` and `#fff` respectively.

For backwards compatability, newer plugin version are able to handle the return value of computed attributes functions using the old API.
The return value is treated as the value to be displayed in the batch.
The colors are set according to their respective default value.

### Relevant data types
```ts
type KeyValuePairs = { [k: string]: string }
type GlobalAttributeDict = { [name: string]: GlobalAttribute}

type GlobalAttribute = {
  name: string,
  value: string,
  min: string,
  max: string,
}

type CellDataCollection = {
  globalAttributes: GlobalAttributeDict,
  cellAttributes: KeyValuePairs,
}
```

### Example of a computed attributes function accessing the value of a cell attribute
```js
function(collection){
    return {"value": parseInt(collection.cellAttributes["A"]) + 5};
}
```

### Example of a computed attributes function accessing a global attribute's maximum value
```js
function(collection){
    return {"value": collection.globalAttributes["Knowledge"].max};
}
```

## Testing functions

To write working js functions more easily, you can use the provided [Testbench.js](https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/blob/main/TestBench.js) file. It provides example data structured in the way [aggregation functions](aggregation_functions.md) and [computed attributes functions](computed_attributes_functions.md) will receive the data in an AttackGraph.

It is recommended to copy the code into the debugger of your choice, or an online tool like [JSFiddle](https://jsfiddle.net/jsx0hvcw/) for better debugging functionality.

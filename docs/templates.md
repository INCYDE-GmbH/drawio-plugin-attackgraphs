# Template Code for Aggregation Functions

## OR 1

Select the minimum value of each attribute.

```js
function (collection) {
    var result = {};
    collection.childAttributes.forEach(function(child) {
        for (var attribute in child.attributes) {
            if (attribute in result) {
                result[attribute] = Math.min(result[attribute], parseInt(child.attributes[attribute]))
            } else {
                result[attribute] = parseInt(child.attributes[attribute]);
            }
        }
    });
    return result;
}
```

## OR 2

Select the worst child regarding feasibility.
Does not resolve multiple childs with same feasibility.

```js
function (collection) {
    var worstNode = collection.childAttributes[0];
    var worstValue = 0;
    collection.childAttributes.forEach(function(child) {
        var value = parseInt(child.attributes['custom']);
        if (value > worstValue) {
            worstValue = value;
            worstNode = child;
        }
    });
    var result = worstNode.attributes;
    delete result['custom'];
    return result;
}
```

## OR 3

Select the worst child regarding feasibility and resolve multiple feasibilities with a tie-breaker.

```js
function (collection) {
    var result = null;
    if (collection.childAttributes.length == 1) {
        result = collection.childAttributes[0].attributes;
    } else {
        var candidates = [];
        var worstValue = 0;
        collection.childAttributes.forEach(function(child) {
            var value = parseInt(child.attributes['custom']);
            if (value > worstValue) {
                worstValue = value;
                candidates = [];
                candidates.push(child);
            } else if (value == worstValue) {
                candidates.push(child);
            }
        });
        var tiebreaker = function(candidates, name) {
            var min_value = 6;
            candidates.forEach(function(node) {
                min_value = Math.min(min_value, node.attributes[name]);
            });
            result = [];
            candidates.forEach(function(node) {
                if (node.attributes[name] == min_value) {
                    result.push(node);
                }
            });
            return result;
        };
        if (candidates.length > 1) {
            candidates = tiebreaker(candidates, "Resources");
            if (candidates.length > 1) {
                candidates = tiebreaker(candidates, "Knowledge");
            }
        }
        result = candidates[0].attributes;
    }
    delete result['custom'];
    return result;
}
```


## AND 1

Sum up all attributes. Limit "Location" to 1 and all other attributes to 5.

```js
function (collection) {
    var result = {};
    collection.childAttributes.forEach(function(child) {
        for (var attribute in child.attributes) {
            if (attribute != "Feasibility") {
                if (attribute in result) {
                    result[attribute] += parseInt(child.attributes[attribute]);
                } else {
                    result[attribute] = parseInt(child.attributes[attribute]);
                }
            }
        }
    });
    for (var attribute in result) {
        if (attribute == "Location") {
            result[attribute] = Math.min(1, result[attribute]);
        } else {
            result[attribute] = Math.min(5, result[attribute]);
        }
    }
    return result;
}
```

## Security Controls

```js
function (collection) {
    var result = collection.localAttributes;
    collection.childAttributes.forEach(function(child) {
        for (var attribute in child.attributes) {
            var securityControlValue = parseInt(child.attributes[attribute]);
            var resultValue = parseInt(result[attribute]);
            if (securityControlValue !== NaN && resultValue !== NaN) {
                result[attribute] = resultValue + securityControlValue;
            }
        }
    });
    return result;
}
```

## Aggregation using **impact**

```js
function (collection) {
    var result = {};
    collection.childAttributes.forEach(function(child) {
        var impact = 1;
        if (child.edgeWeight !== null) {
            impact = child.edgeWeight;
        }
        for (var attribute in child.attributes) {
              if (attribute in result) {
                  result[attribute] += parseInt(child.attributes[attribute]) * impact;
              } else {
                  result[attribute] = parseInt(child.attributes[attribute]) * impact;
            }
        }
    });
    return result;
}
```
# Template Code for Computed Attributes

## Feasibility 1

Invert "Knowledge" and "Resources". Subtract "Location".

```js
function (collection) {
    return Math.min(5,
        Math.max(1,
            Math.max(
                6 - parseInt(collection.cellAttributes["Knowledge"]),
                6 - parseInt(collection.cellAttributes["Resources"])
            ) - parseInt(collection.cellAttributes["Location"]))
        );
}
```

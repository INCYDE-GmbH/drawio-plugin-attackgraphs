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
        var value = parseInt(child.computedAttribute);
        if (value > worstValue) {
            worstValue = value;
            worstNode = child;
        }
    });
    var result = worstNode.attributes;
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
            var value = parseInt(child.computedAttribute);
            if (value > worstValue) {
                worstValue = value;
                candidates = [];
                candidates.push(child);
            } else if (value == worstValue) {
                candidates.push(child);
            }
        });
        var tiebreaker = function(candidates, name, max) {
            var min_value = max;
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
            candidates = tiebreaker(candidates, "Resources", collection.globalAttributes["Resources"].max);
            if (candidates.length > 1) {
                candidates = tiebreaker(candidates, "Knowledge", collection.globalAttributes["Knowledge"].max);
            }
        }
        result = candidates[0].attributes;
    }
    return result;
}
```


## AND 1

Sum up all attributes. Limit attributes to their maximum value.

```js
function (collection) {
    var result = {};
    collection.childAttributes.forEach(function(child) {
    for (var attribute in child.attributes) {
            if (attribute in result) {
                result[attribute] += parseInt(child.attributes[attribute]);
            } else {
                result[attribute] = parseInt(child.attributes[attribute]);
            }
        }
    });
    for (var attribute in result) {
        if (attribute in collection.globalAttributes) {
            result[attribute] = Math.min(collection.globalAttributes[attribute].max, result[attribute]);
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
        Math.max(collection.globalAttributes["Location"].max,
            Math.max(
                parseInt(collection.globalAttributes["Knowledge"].max) + 1 - parseInt(collection.cellAttributes["Knowledge"]),
                parseInt(collection.globalAttributes["Resources"].max) + 1 - parseInt(collection.cellAttributes["Resources"])
            ) - parseInt(collection.cellAttributes["Location"]))
        );
}
```

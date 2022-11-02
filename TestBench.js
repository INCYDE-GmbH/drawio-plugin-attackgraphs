const globalAttributes = {
    'Knowledge': {
        name: 'Knowledge',
        value: '0',
        min: '0',
        max: '10'
    },
    'Resources': {
        name: 'Resources',
        value: '0',
        min: '0',
        max: '10'
    },
    'Location': {
        name: 'Location',
        value: '0',
        min: '0',
        max: '10'
    }
};

const childAttributes = [
    {
        edgeWeight: 1,
        id: 'node1',
        attributes: {
            'Knowledge': 3,
            'Resources': 4,
            'Location': 2
        },
        computedAttribute: 7
    },
    {
        edgeWeight: 2,
        id: 'node2',
        attributes: {
            'Knowledge': 7,
            'Resources': 8,
            'Location': 3
        },
        computedAttribute: 4
    },
    {
        edgeWeight: 1,
        id: 'node3',
        attributes: {
            'Knowledge': 9,
            'Resources': 4,
            'Location': 3
        },
        computedAttribute: 6
    }
]

const cellAttributes =
{
    'Knowledge': 3,
    'Resources': 4,
    'Location': 2
}

const agg_collection = {
    globalAttributes: globalAttributes,
    childAttributes: childAttributes,
    localAttributes: cellAttributes,
}

const com_collection = {
    globalAttributes: globalAttributes,
    cellAttributes: cellAttributes,
}

function aggregationFunction() {
    // YOUR AGGREGATION FUNCTION HERE

    return myFunction(agg_collection);
}

function computedAttributesFunction() {
    // YOUR COMPUTED ATTRIBUTES FUNCTION HERE

    return myFunction(com_collection);
}

// FUNCTION TO USE AS ATTACKGRAPH FUNCTION
const myFunction = function (collection) {

}

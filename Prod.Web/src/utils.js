export function extractFloat(value) {
    const pat = /-?\d+([.,]\d+)?/g;
    const result = value === null || value === undefined ?
        NaN :
        typeof (value) === "number" ?
            value :
            typeof (value) != "string" ?
                NaN :
                value.match(pat) ?
                    parseFloat(value.match(pat)[0].replace(',', '.')) :
                    NaN
    return result
}

export function padNumbers(str, numlen) {
    return str.replace(/\d+/g, match =>
        "0".repeat(numlen - match.length) + match
    )
}

export function stringFormat(formatstring) {
    var args = Array.prototype.slice.call(arguments, 1)
    return formatstring.replace(/\{(\d+)\}/g, function (match, number) {
        return typeof args[number] !== 'undefined'
            ? args[number]
            : match
    })
}

export function* processData(data) {
    if (!data) { return; }
    for (var i = 0; i < data.length; i++) {
        var val = data[i];
        yield val;

        if (val.children) {
            yield* processData(val.children);
        }
    }
}

export function* processTree(tree) {
    yield tree
    yield* processData(tree.children)
}

export function arraysEqual(arr1, arr2) {
    // warning: this definition has some limitations
    return (arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]))
    // return JSON.stringify(a1)===JSON.stringify(a2);
}

export function arrayConditionalReplace(arr, replacewitharr) {
    // This is a function to avoid unneccesarry updates of array
    // Especially usefull for mobx arrays, to avoid cascading updates of linked observables
    if (!arraysEqual(arr, replacewitharr)) {
        arr.replace(replacewitharr)
    }
}


// ********************************************************************************
// Util functions that is not general purpose, but linked to the NBIC datastructure
// ********************************************************************************
export function codegroup2labelobj(group) {
    const grobj = group.reduce((acc, o) => {
        acc[o.Value] = o.Text
        return acc
    }, {})
    return grobj
}
export function codes2labels(codes) {
    const grkeys = Object.keys(codes)
    const labels = grkeys.reduce((acc, key) => {
        const group = codes[key]
        const grobj = codegroup2labelobj(group)
        acc[key] = grobj
        return acc
    }, {})
    return labels
}

// export function getCriterion(riskAssessment, akse, letter) {
// 	const result = riskAssessment.criteria.filter(c => c.akse === akse && c.criteriaLetter === letter)[0];
// 	return result;
// 	// return "Not implemented"
// }


// ********************************************************************************


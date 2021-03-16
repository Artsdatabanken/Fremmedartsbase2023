export function extractFloat(value) {
	const pat = /-?\d+([.,]\d+)?/g;
	const result = value === null || value === undefined ?
		NaN :
		typeof(value) === "number" ?
		value :
		typeof(value) != "string" ?
		NaN :
		value.match(pat) ?
		parseFloat(value.match(pat)[0].replace(',','.')) :
		NaN
	return result                        
} 

export function padNumbers(str, numlen) { 
    return str.replace(/\d+/g, match =>
        "0".repeat(numlen - match.length) + match
    )
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
// ********************************************************************************


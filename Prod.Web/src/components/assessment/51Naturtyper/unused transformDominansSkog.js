import config from '../../../config';
import { padNumbers } from '../../utils'

// const padNumbers = (str, numlen) =>
//     str.replace(/\d+/g, match =>
//         "0".repeat(numlen - match.length) + match
//     )

export function createDominansSkogTree(kodeliste) {
    const sk_ = kodeliste.filter(item => item.Kode.Id.startsWith(config.nin.dominansSkog + '_'))
    const sk = sk_.map(item => {
        //console.log("#¤#¤# " + JSON.stringify(item))
        const code = item.Kode.Id
        const name = item.Navn
        const sortid = padNumbers(code, 2)
        const names = name.split(';').map(item => item.trim())
        const text = code + " " + names[0] + (names.length > 1 ? " (" + names[1] + ")" : "")
        // console.log("code" + code + " " + name)
        return { value: code, sortid: sortid, text: text, name: names }
    })
    const sortfunc = (a, b) => a.sortid > b.sortid ? 1 : -1
    const result = sk.sort(sortfunc)
    //result.unshift({value: null, sortid: "", text: "", name: [""]}) // add empty selection
    return result
}

export function createDominansSkogLabelList(items) {
    const result = items.reduce((acc, item) => {
        const k = item.value
        acc[k] = item.name
        return acc
    }, {})
    return result
}
export function createDominansSkogKoder(items) {
    const result = items.map(item => {
        return {
            Value: item.value,
            Text: item.text
        }
    })
    return result
}

export default function transformDominansSkog(kodeliste) {
    const tree = createDominansSkogTree(kodeliste)
    const koder = createDominansSkogKoder(tree)
    const labels = createDominansSkogLabelList(tree)
    const result = {
        tree: tree,
        koder: koder,
        labels: labels
    }
    return result
}

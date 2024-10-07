import { padNumbers } from '../../utils'

// const padNumbers = (str, numlen) =>
//     str.replace(/\d+/g, match =>
//         "0".repeat(numlen - match.length) + match
//     )


export function getNAItems(kodeliste) {
    const na = kodeliste.filter(item => item.Kode.Id.startsWith("NA "))
    return na
}


export function createNaLabelList(naItems) {
    const result = naItems.reduce((acc, item) => {
        const k = item.Kode.Id
        const k2 = k.substr(3)
        acc[k2] = item.Navn
        return acc
    }, {})
    return result
}


export function createNaTree(naItems) {
    const na = naItems.reduce((acc, item) => {
        //console.log("#¤#¤# " + JSON.stringify(item))
        const k = item.Kode.Id
        const k2 = k.substr(3)
        // console.log("k2'" + k2 + "'")
        acc[k2] = item
        return acc
    }, {})
    const sortfunc = (a, b) => a.sortid > b.sortid ? 1 : -1
    const getKEnheter = kode => kode.Kartleggingsenheter[5000]
    const getGrunnTyper = kode => kode.UnderordnetKoder
    const subtypeFuncs = {
        T: getKEnheter,
        V: getKEnheter,
        H: getGrunnTyper,
        I: getGrunnTyper,
        F: getGrunnTyper,
        M: getGrunnTyper,
        L: getGrunnTyper,
    }
    const getNT = htKode =>
        na[htKode].UnderordnetKoder.map(item =>
            item.Id.substr(3)
        ).map(id => {
            const kod = na[id]
            let children
            try {
                children = subtypeFuncs[htKode](kod).map(item =>
                    item.Id.substr(3)
                ).map(id => {
                    const kod = na[id]
                    return { id: id, sortid: padNumbers(id, 2), name: kod.Navn }

                })
            }
            catch (e) {
                children = [] // catch should not happen if code lists are ok
                console.log("grunntype for " + id + " error: " + e.message)
                // appInsights.trackException(e)
            }

            return { id: id, sortid: padNumbers(id, 2), name: kod.Navn, children: children.sort(sortfunc), collapsed: true }
        }).sort(sortfunc)

    const keys = Object.keys(subtypeFuncs)

    const result = keys.map(key => {
        const htgr = na[key]
        // console.log("-key-" + key)
        const nts = getNT(key)
        return { id: key, name: htgr.Navn, children: nts, collapsed: true }
    })
    return result
}

export default function transformNaturtypeKoder(naItems) {
    const items = getNAItems(naItems)
    const labels = createNaLabelList(items)
    const naturtypetree = createNaTree(items)
    const result = { naturtypetree: naturtypetree, labels: labels }
    return result
}

import {codes2labels} from '../utils'



function koder2migrationPathways(mp) {
    const r = {}
    r.name = mp.Text
    // console.log(r.name)
    r.value = mp.Value
    if(mp.Children) {
        r.children = []
        const mpckey = Object.keys(mp.Children)[0]
        const mpc = mp.Children[mpckey]
        for ( var i = 0; i < mpc.length; ++i )
        {
            r.children.push(koder2migrationPathways(mpc[i]));
        }
    }
    return r
}

function transformlivsmedium(mp) {
    const r = {}
    r.Id = mp.Id
    r.Value = mp.Id
    // console.log(r.name)
    r.Text = mp.navn
    r.Collapsed = true
    r.Children = []
    if(mp.children) {
        for ( var i = 0; i < mp.children.length; ++i )
        {
            r.Children.push(transformlivsmedium(mp.children[i]));
        }
    }
    return r
}

function transformlivsmediumlabels(mp, acc) {
    acc[mp.Id] = mp.navn
    if(mp.children) {
        for ( var i = 0; i < mp.children.length; ++i )
        {
            transformlivsmediumlabels(mp.children[i], acc)
        }
    }
    return acc
}


function transformtrueteogsjeldnenaturtyper(nt) {
    return nt
}



// NBNBNBNBNB!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function gettrueteogsjeldnenaturtypercodes(nt, arr) {
    arr.push("NA " + nt.Value)
    if(nt.Children) {
        for ( var i = 0; i < nt.Children.length; ++i )
        {
            gettrueteogsjeldnenaturtypercodes(nt.Children[i], arr)
        }
    }
    return arr
    // console.log("!!! trueteogsjeldnenaturtypercodes: " + JSON.stringify(arr))
}


function transformnaturtyperNIN2(nin2codes) {
    const r = {}
    r.Id = nin2codes.Id
    r.Value = nin2codes.Id
    r.Text = nin2codes.Text
    r.Collapsed = true
    if(nin2codes.Redlisted) {
        r.Redlisted = nin2codes.Redlisted
    }
    r.Children = []
    if(nin2codes.Children) {
        for ( var i = 0; i < nin2codes.Children.length; ++i )
        {
            r.Children.push(transformnaturtyperNIN2(nin2codes.Children[i]));
        }
    }
    // console.log("!!! r.Id: " + JSON.stringify(r.Id))
    return r
}




function createCodeLists() {
    const r = {}
    const codes = require('../FA3CodesNB.json')
    r.koder = codes.Children
    const clabels =  codes2labels(r.koder.labels[0].Children)
    r.codeLabels = clabels


    // load livsmedium codes ----
    const ninlm = require('../nin-livsmedium.json')
    const lm = transformlivsmedium(ninlm)
    // console.log("livsmedium2nt: " +  JSON.stringify(lm))
    const lmlabels = transformlivsmediumlabels(ninlm, {})
    // console.log(JSON.stringify(lmlabels))
    const grupper = lm.Children
    r.livsmediumLabels = lmlabels
    r.livsmediumCodes = grupper
    // --------------------------

    // load truede naturtyper codes ----
    const togsnt = require('../TrueteOgSjeldneNaturtyper2018.json')
    const nt = transformtrueteogsjeldnenaturtyper(togsnt)
    // console.log("trueteogsjeldnenaturtyper: " +  JSON.stringify(nt))
    const tsgrupper = nt.Children
    r.trueteogsjeldneCodes = tsgrupper


    r.trueteogsjeldnenaturtypercodes = gettrueteogsjeldnenaturtypercodes(togsnt, [])
    console.log("!!! gettrueteogsjeldnenaturtypercodes" + JSON.stringify(r.trueteogsjeldnenaturtypercodes))

    // --------------------------


    // load NiN2 codes ----
    const nin2root = require('../Nin2_3.json')
    // console.log("nin2naturtyper: " +  JSON.stringify(nin2root))
    const nin2grupper = nin2root.Children
    r.naturtyperNIN2 = nin2grupper

    const nin2codes = r.koder.naturtyperNIN2
    const nin2 = transformnaturtyperNIN2(nin2codes)
    // console.log("nin2 transformed: " +  JSON.stringify(nin2))
    // const nin2grupper = nin2.Children
    // r.naturtyperNIN2 = nin2grupper
    // --------------------------
    r.nin2codes = nin2codes
    r.nin2 = nin2

    //-----------------------------------------------------

    const mp = r.koder.migrationPathways[0]
    r.spredningsveier = koder2migrationPathways(mp)
    //-----------------------------------------------------
    return r
}


const codeLists = createCodeLists()



function isTrueteogsjeldnenaturtype(ntcode) {
    return codeLists.trueteogsjeldnenaturtypercodes.includes(ntcode)
}




// r.koder,
// r.codeLabels,
// r.livsmediumLabels,
// r.livsmediumCodes,
// r.trueteogsjeldneCodes,
// r.trueteogsjeldnenaturtypercodes,


// r.naturtyperNIN2,
// r.nin2codes,
// r.nin2,
// r.spredningsveier,







export {codeLists, isTrueteogsjeldnenaturtype}
import {action, autorun, extendObservable, observable, reaction, runInAction, trace} from 'mobx';
import RiskLevel from './riskLevel';
// import {extractFloat, getCriterion} from '../../utils'
import {arrayConditionalReplace, extractFloat} from '../../utils'
import { EventNote } from '@material-ui/icons';
import config from '../../config';
// import errorhandler from '../errorhandler';
import { JsonHubProtocol } from '@microsoft/signalr';

function round(num){return Math.round(num)}
function ceil(num){return Math.ceil(num)}
function trunc(num){return Math.trunc(num)}
function min(num1,num2){return Math.min(num1,num2)}
function max(num1,num2){return Math.max(num1,num2)}
function sqrt(num){return Math.sqrt(num)}
const pi = Math.PI
function roundToSignificantDecimals(num) {
    // console.log("run roundToSignificantDecimals")
    if (num === null) return 0;
    const result =
        (num >= 10000000) ? trunc(num / 1000000) * 1000000 :
        (num >= 1000000 ) ? trunc(num / 100000)  * 100000  :
        (num >= 100000  ) ? trunc(num / 10000)   * 10000   :
        (num >= 10000   ) ? trunc(num / 1000)    * 1000    :
        (num >= 1000    ) ? trunc(num / 100)     * 100     :
        (num >= 100     ) ? trunc(num / 10)      * 10      :
        num
    return result
}
function roundToSignificantDecimals2(num) {   // todo: spør om grenseverdiene (100 vs 99.5, og 2(?))
    if (num === null) return 0;
    const result =
        // (num >= 10000000) ? round(num / 1000000) * 1000000 :
        // (num >= 1000000 ) ? round(num / 100000)  * 100000  :
        // (num >= 100000  ) ? round(num / 10000)   * 10000   :
        // (num >= 10000   ) ? round(num / 1000)    * 1000    :
        // (num >= 1000    ) ? round(num / 100)     * 100     :
        // (num >= 100     ) ? round(num / 10)      * 10      :
        (num >= 99.5    ) ? trunc(num / 10)      * 10      :
        (num >= 9.95    ) ? trunc(num / 1)       * 1      :
        (num >= 2    ) ? trunc(num / 0.1)      * 0.1      :
        (num <  2    ) ? trunc(num / 0.01)      * 0.01      :
        num
    return result
}

const nonCountingNaturetypes = [
    // F9–F13, H4, L14–L17, O6+O7, T35–T45 og V11–V13.
    "F9","F10","F11","F12","F13",
    "H4",
    "L14","L15","L16","L17",
    "O6","O7",
    "T35","T36","T37","T38","T39","T40","T41","T42","T43","T44","T45",
    "V11","V12","V13"
]
function getBaseNaturetypeCode(nincode) {
    const code = nincode.startsWith("NA ") ? nincode.substr(3) : nincode
    const indexofbar = code.indexOf("-")
    const base = indexofbar === -1 ? code : code.substr(0, indexofbar)
    return base
}

function yearlyIncreaseLevel(numMYear) {
    const num = numMYear // numKmYear * 1000
    const result =
        num >= 500 ? 3
        : num >= 160 ? 2
        : num >= 50 ? 1
        : 0
    return result
}
// function medianLifespanLevel(num) {
//     const result =
//         num >= 650 ? 3
//         : num >= 60 ? 2
//         : num >= 10 ? 1
//         : 0
//     return result
// }

const introLowTable = {
    1: 1,
    5: 2,
    13: 3,
    26: 4,
    43: 5,
    65: 6,
    91: 7,
    121: 8,
    156: 9,
    195: 10
}
const introHighTable = {
    1: 1,
    6: 2,
    15: 3,
    29: 4,
    47: 5,
    69: 6,
    96: 7,
    127: 8,
    163: 9,
    204: 10
}

function introductionNum(table, best) {
    const keys = Object.keys(table).reverse()
    // console.log("¤&introductionNum keys: " + JSON.stringify(keys))
    var i = 0
    for(const key of keys) {
        if(best >= key) {
            i = table[key]
            break
        }
    }
    // console.log("¤&introductionNum result: " + i + " type:" + typeof(i))
    return i
}





// function levelFloor(level) {
//     return level === NaN ? NaN
//     : typeof(level) === "number"
//     ? Math.max(0, level - 1)
//     : NaN
// }

// for nullableints: give 0 if null. (undefined and NaN is unchanged!)
function n0(num) {
    return num === null
        ? 0
        : num
}
// for divisor = 0 or null give 1
function d1(num) {
    return num === null || num === 0
        ? 1
        : num
}

function uncertaintyArray(low, high) {
    const arr = []
    for (let n = 0; n < 4 ; n++) {
        if(!(low >= n && high <= n)) {
            arr.push(n)
        }
    }
    return arr
}

function uncertaintyArrayReverse(uarray) {
    const arr = []
    for (let n = 0; n < 4 ; n++) {
        if(!uarray.includes(n)) {
            arr.push(n)
        }
    }
    return arr
}


function filterUncertaintyArray(orgarr, filterarr) {
    const result = []
    for(const item of orgarr) {
        if (filterarr.includes(item)) {
            result.push(item)
        }
    }
    console.log("#¤# critA filterUncertaintyArray: " + JSON.stringify(orgarr) + " # " + JSON.stringify(filterarr) + " # " + JSON.stringify(result))
    return result
}
function uncertaintyArrayAddValue(orgarr, value) {
    if (!orgarr.includes(value)) {
        orgarr.push(value)
    }
    const result = orgarr.splice(0).sort()
    console.log("#¤# critA uncertaintyArrayAddValue: " + JSON.stringify(orgarr) + " # " + value + " # " + JSON.stringify(result))
    return result
}

function criterionLow(criterion) {
    const unc = criterion.uncertaintyValues
    const value = criterion.value
    // console.log("crit_low: " + value + JSON.stringify(unc))
    const result =
        unc.length === 0
        ? value
        : Math.min(...unc)
    return result
}
function criterionHigh(criterion) {
    const unc = criterion.uncertaintyValues
    const value = criterion.value
    // console.log("crit_high: " + value + JSON.stringify(unc))
    const result =
        unc.length === 0
        ? value
        : Math.max(...unc)
    return result
}

function findUncertainityAbove (levels, level){
    var uncertainityAbove = 0
    for (var i = 0; i < levels.length; i ++) {
        if (levels[i] > level && levels[i] > uncertainityAbove) {
            uncertainityAbove = levels[i];
        }
    }
    return uncertainityAbove == 0 ? "" : uncertainityAbove
}

// function enhanceRiskAssessmentAddErrorReportingHandler(riskAssessment) {
//         extendObservable(riskAssessment, errorhandler)
// }



function enhanceRiskAssessmentInvasjonspotensiale(riskAssessment) {
// ---------------------------------------------------------------
// --------  List of variables that comes from user input --------
// ---------------------------------------------------------------
// for variables market with "**" - this variable is not part of the criteria calculation - but is used for qa and presentation
// types marked with "?" is nullable (but some are required in specific methods)
// note: all variable names ending with "Input" has a matching calculated value, without the "Input"-ending
//
//chosenSpreadMedanLifespan	#radio (ametod)
//acceptOrAdjustCritA 		#radio
//AOOtotalBest 	#integer?	# beste anslag på totalt forekomstareal nå
//AOOtotalLow  **	#integer? 	# lavt anslag på totalt forekomstareal nå
//AOOtotalHigh **	#integer? 	# høyt anslag på totalt forekomstareal nå
//AOO50yrBest	#integer?	# beste anslag på totalt forekomstareal om 50 år
//AOO50yrLow	#integer?	# lavt anslag på totalt forekomstareal om 50 år
//AOO50yrHigh	#integer?	# høyt anslag på totalt forekomstareal om 50 år
//medianLifetimeInput	#integer?	# artens mediane levetid i Norge i år
//lifetimeLowerQInput 	#integer?	# nedre kvartil for artens levetid i Norge i år
//lifetimeUpperQInput	#integer?	# øvre kvartil for artens levetid i Norge i år
//introductionsBest	    #number?	# beste anslag på antall introduksjoner i løpet av 10 år
//populationSize 	**!	#integer?	# bestandens nåværende størrelse (individtall)
//growthRate	    **	#number?	# bestandens multiplikative vekstrate
//envVariance	    **	#number?	# miljøvarians
//demVariance	    **	#number?	# demografisk varians
//carryingCapacity	**  #integer?	# bestandens bæreevne (individtall)
//extinctionThreshold **	#integer?	# kvasiutdøingsterskel (individtall)
//
//chosenSpreadYearlyIncrease radio (bmetod)
//expansionSpeedInput	#integer?	# ekspansjonshastighet i meter per år
//expansionLowerQInput	#integer?	# nedre kvartil for ekspansjonshastighet i meter per år
//expansionUpperQInput	#integer?	# øvre kvartil for ekspansjonshastighet i meter per år
//AOO1		#integer?	# forekomstarealet i år 1
//AOO2		#integer?	# forekomstarealet i år 2
//AOOyear1	#integer?	# årstallet for det første forekomstarealet
//AOOyear2	#integer?	# årstallet for det andre forekomstarealet
//AOOknown	#integer?	# kjent forekomstareal
//occurrences1Best	    #integer?	# beste anslag på antall forekomster fra 1 introduksjon
//occurrences1Low		#integer?	# lavt anslag på antall forekomster fra 1 introduksjon
//occurrences1High	    #integer?	# høyt anslag på antall forekomster fra 1 introduksjon




    const r = riskAssessment
    function adjustAOOInput(input) {
        const inputvalue = input === NaN ? 0 : input
        const result = 
            r.doorKnocker 
            ? inputvalue
            : ceil((inputvalue / 4) * 4)
        return result

    }

    extendObservable(riskAssessment, {
        //get notUseSpeciesMap() { return true},

        get doorKnocker() {
            console.log("#¤% alienSpeciesCategory " + riskAssessment.vurderingAlienSpeciesCategory)
            return riskAssessment.vurderingAlienSpeciesCategory === "DoorKnocker"
        },
        get ametodkey() {
            const method = riskAssessment.chosenSpreadMedanLifespan
            const a1submethod = r.acceptOrAdjustCritA
            const result =
                method === "LifespanA1aSimplifiedEstimate"
                ? !r.doorKnocker
                    ? a1submethod === "accept"
                        ? "A1a1" // "forekomstareal forenklet"
                        : "A1a2" // "forekomstareal justert"
                    : a1submethod === "accept"
                        ? "A1b1" // "introduksjonspress forenklet" (dørstokkart)
                        : "A1b2" // "introduksjonspress justert"   (dørstokkart)
                : method === "SpreadRscriptEstimatedSpeciesLongevity"
                ? "A2"
                : method === "ViableAnalysis"
                ? "A3"
                : "AmethodInvalid"
            return result
        },
        get bmetodkey() {
            const method = riskAssessment.chosenSpreadYearlyIncrease
            const result =
                method === "a"
                ? "B1"
                : method === "b"
                ? !r.doorKnocker
                    ? "B2a"
                    : "B2b"
                : method === "c"  // no longer in use (??)
                ? "B2bX"
                : "BmethodNotChosen"
            console.log("##¤bmetod " + result + " doorKnocker: " + r.doorKnocker)
            return result
        },
        get introductionsLow() {
            const num = introductionNum(introLowTable, r.introductionsBest)
            return num == 0 ? 0 : round(r.introductionsBest) - num
        },
        get introductionsHigh() {
            const num = introductionNum(introHighTable, r.introductionsBest)
            return num == 0 ? 0 : round(r.introductionsBest) + num
        },
        get AOO10yrBest() {
            const result =
                r.occurrences1Best === 0 && r.introductionsBest === 0
                ? 0
                : r.occurrences1Best === 0
                ? 4 * round(0.64 + 0.36 * r.introductionsBest)
                : 4 * round(r.occurrences1Best + Math.pow(r.introductionsBest,(r.occurrences1Best + 9)/10))
            console.log("#AOO10yrBest " + r.occurrences1Best + "!" + r.introductionsBest + " result: " + result)
            return result
        },
        get AOO10yrLow() {
            const result =
                r.occurrences1Low === 0 && r.introductionsLow === 0
                ? 0
                : r.occurrences1Low === 0
                ? 4 * round(0.64 + 0.36 * r.introductionsLow)
                : 4 * round(r.occurrences1Low + Math.pow(r.introductionsLow, (r.occurrences1Low + 9)/10))
            return result
        },
        get AOO10yrHigh() {
            const result =
                r.occurrences1High === 0 && r.introductionsHigh === 0
                ? 0
                : r.occurrences1High === 0
                ? 4 * round(0.64 + 0.36 * r.introductionsHigh)
                : 4 * round(r.occurrences1High + Math.pow(r.introductionsHigh,(r.occurrences1High + 9)/10))
            return result
        },

        // get AOOchangeBest() { return r.AOOtotalBest < 4 ? 1 : n0(r.AOO50yrBest) / d1(r.AOOtotalBest) }, // nb AOOtotalBest is allways >= 4 (so really no need to check)
        // get AOOchangeLow() { return r.AOOtotalBest < 4 ? 1 : n0(r.AOO50yrLow) / d1(r.AOOtotalBest) },   // nb AOOtotalBest is allways >= 4 (so really no need to check)
        // get AOOchangeHigh() { return r.AOOtotalBest >= 4 ? 1 : n0(r.AOO50yrHigh) / d1(r.AOOtotalBest) }, // nb AOOtotalBest is allways >= 4 (so really no need to check)
        get AOOchangeBest() { return n0(r.AOO50yrBest) / d1(r.AOOtotalBest) }, // nb AOOtotalBest is allways >= 4 (so really no need to check)
        get AOOchangeLow() { return n0(r.AOO50yrLow) / d1(r.AOOtotalBest) },   // nb AOOtotalBest is allways >= 4 (so really no need to check)
        get AOOchangeHigh() { return n0(r.AOO50yrHigh) / d1(r.AOOtotalBest) }, // nb AOOtotalBest is allways >= 4 (so really no need to check)
        get adefaultBest() {
            return r.doorKnocker ?
            r.AOO10yrBest >= 16 ? 3
            : r.AOO10yrBest >= 4 ? 2
            : r.AOO10yrBest >= 1 ? 1
            : 0
            : r.AOO50yrBest >= 20 && r.AOOchangeBest > 0.2 ? 3
            : r.AOO50yrBest >= 20 && r.AOOchangeBest > 0.05 ? 2
            : r.AOO50yrBest >= 8 && r.AOOchangeBest > 0.2 ? 2
            : r.AOO50yrBest >= 4 ? 1
            : 0
        },
        get adefaultLow() {
            return r.doorKnocker ?
            r.AOO10yrLow >= 16 ? 3
            : r.AOO10yrLow >= 4 ? 2
            : r.AOO10yrLow >= 1 ? max(1, r.adefaultBest - 1)
            : 0
            : r.AOO50yrLow >= 20 && r.AOOchangeLow > 0.2 ? 3
            : r.AOO50yrLow >= 20 && r.AOOchangeLow > 0.05 ? 2
            : r.AOO50yrLow >= 8 && r.AOOchangeLow > 0.2 ? 2
            : r.AOO50yrLow >= 4 ? max(1, r.adefaultBest - 1)
            // : r.AOO50yrLow < 4 ? max(0, r.adefaultBest - 1)
            : 0
        },
        get adefaultHigh() {
            return r.doorKnocker ?
            r.AOO10yrHigh >= 16 ? min(3, r.adefaultBest + 1)
            : r.AOO10yrHigh >= 4 ? min(2, r.adefaultBest + 1)
            : r.AOO10yrHigh >= 1 ? 1
            : 0
            : r.AOO50yrHigh >= 20 && r.AOOchangeHigh > 0.2 ?  min(3, r.adefaultBest + 1)
            : r.AOO50yrHigh >= 20 && r.AOOchangeHigh > 0.05 ?  min(2, r.adefaultBest + 1)
            : r.AOO50yrHigh >= 8 && r.AOOchangeHigh > 0.2 ? min(2, r.adefaultBest + 1)
            : r.AOO50yrHigh >= 4 ? 1
            // : r.AOO50yrHigh < 4 ? 0
            : 0
        },
        get apossibleLow() {
            return r.doorKnocker ?
            r.AOO10yrBest >= 84 ? 3 
            : r.AOO10yrBest >= 20 ? 2
            : r.AOO10yrBest >= 4 ? 1
            : 0
            : (r.AOO50yrBest > 80 && r.AOOchangeBest > 1) ? 3
            : (r.AOO50yrBest >= 20 && r.AOOchangeBest > 0.2) ? 2
            : (r.AOO50yrBest >= 4) ? 1
            : 0
        },

        get apossibleHigh() {
            return r.doorKnocker ?
            r.AOO10yrBest < 4 ? 0 
            : 3
            : (r.AOO50yrBest < 20 && r.AOOchangeBest <= 0.05) ? 2  // todo: check! is this right?
            : (r.AOO50yrBest < 4) ? 1 // todo: check! is this right?
            : 3
        },
        get ascore() {
            const k = r.ametodkey
            return (k === "A1a1" || k === "A1b1") ? r.adefaultBest
            : (k === "A1a2" || k === "A1b2") ?
                riskAssessment.critA.value
            : (k === "A2" || k === "A3") ?
                r.medianLifetime >= 650 ? 3
                : r.medianLifetime >= 60 ? 2
                : r.medianLifetime >= 10 ? 1
                : r.medianLifetime < 10 ? 0
                : 0
            : 0 // NaN?
        },
        get alow() {
            const k = r.ametodkey
            return (k === "A1a1" || k === "A1b1") ? r.adefaultLow
            : (k === "A2" || k === "A1a2" || k === "A1b2") ?
                criterionLow(riskAssessment.critA)
            : k === "A3" ?
                r.lifetimeLowerQ >= 650 ? 3 :
                r.lifetimeLowerQ >= 60 ? 2 :
                r.lifetimeLowerQ >= 10 ? max(1, r.ascore - 1)  :
                r.lifetimeLowerQ < 10 ? max(0, r.ascore - 1)  :
                0
            : 0 // 1 / NaN?
        },
        get ahigh() {
            const k = r.ametodkey
            return (k === "A1a1" || k === "A1b1") ? r.adefaultHigh
            : (k === "A2" || k === "A1a2" || k === "A1b2") ?
                criterionHigh(riskAssessment.critA)
            : k === "A3" ?
                r.lifetimeUpperQ >= 650 ? min(3, r.ascore + 1) :
                r.lifetimeUpperQ >= 60 ? min(2, r.ascore + 1) :
                r.lifetimeUpperQ >= 10 ? 1 :
                r.lifetimeUpperQ < 10 ? 0 :
                0
            : 0 // 1 / NaN?
        },


        get aDisabledUncertaintyValues() {
            // console.log("uncarr A")

            const result = uncertaintyArray(r.alow, r.ahigh)
            console.log("¤##uncarr A: " + r.ametodkey + "!"   + r.alow + "!"  + r.ahigh + "¤"+ r.lifetimeUpperQ + "!"  + JSON.stringify(result))
            return result
        },
        get medianLifetime() {
            const k = r.ametodkey
            console.log("medianLifetime methodkey: " + k)
            const result = (k === "A1a1" || k === "A1b1") ?
                r.ascore === 0 ? 3
                : r.ascore === 1 ? 25
                : r.ascore === 2 ? 200
                : r.ascore === 3 ? 2000
                : 0
            : roundToSignificantDecimals(r.medianLifetimeInput)
            console.log("medianLifetime result: " + result)
            return result
        },
        get lifetimeLowerQ() {
            return roundToSignificantDecimals(r.lifetimeLowerQInput)
        },
        get lifetimeUpperQ() {
            return roundToSignificantDecimals(r.lifetimeUpperQInput)
        },
        get lifetimeText() {
            return r.adefaultBest === 0 ? "under 10 år"
            : r.adefaultBest == 1 ? "mellom 10 år og 60 år"
            : r.adefaultBest == 2 ? "mellom 60 år og 650 år"
            : r.adefaultBest == 3 ? "over 650 år"
            : "%%%%%"
        },
        get extinctionText() {
            return r.adefaultBest === 0 ? "over 97%"
            : r.adefaultBest == 1 ? "mellom 43 og 97"
            : r.adefaultBest == 2 ? "mellom 60 år og 650 år"
            : r.adefaultBest == 3 ? "under 5%"
            : "%%#%%"
        },
        get a1aresulttext() {
            return `Basert på de beste anslagene på forekomstareal i dag (${r.AOOtotalBest} km²) og om 50 år (${r.AOO50yrBest} km²) er A-kriteriet forhåndsskåret som ${r.adefaultBest + 1} (med usikkerhet: ${r.adefaultLow + 1}–${r.adefaultHigh + 1}). Dette innebærer at artens mediane levetid ligger ${r.lifetimeText}, eller at sannsynligheten for utdøing innen 50 år er på ${r.extinctionText}.`
        },

        get a1bresulttext() {
           return `Basert på det beste anslaget på ${r.occurrences1Best} forekomster i løpet av 10 år og ${r.introductionsBest} ytterligere introduksjon(er) i samme tidsperiode er A-kriteriet forhåndsskåret som ${r.adefaultBest + 1} (med usikkerhet: ${r.adefaultLow + 1}–${r.adefaultHigh + 1}). Dette innebærer at artens mediane levetid ligger ${r.lifetimeText}, eller at sannsynligheten for utdøing innen 50 år er på ${r.extinctionText}.`
        },

        get invationPotentialLevel() {
            return riskAssessment.invationpotential.level
        },

        get invationPotentialUncertainityText() {
            return !r.invationPotentialUncertaintyLevels || r.invationPotentialUncertaintyLevels == [] || findUncertainityAbove(r.invationPotentialUncertaintyLevels, r.invationPotentialLevel) == 0 ? "" 
                    : r.invationPotentialUncertaintyLevels.length == 1 && r.invationPotentialUncertaintyLevels[0] > r.invationPotentialLevel ? `(usikkerhet opp mot ${r.invationPotentialUncertaintyLevels[0]})`
                    : ` (usikkerhet opp mot ${findUncertainityAbove(r.invationPotentialUncertaintyLevels, r.invationPotentialLevel)})`
        },

        get invationPotentialText() {
           return `Delkategori invasjonspotensial: ${r.invationpotential.level + 1}${r.invationPotentialUncertainityText}.`
        },

        get ecoEffectLevel () {
            return riskAssessment.ecoeffect.level
        },

        get ecoEffectText() {
            return `Delkategori økologisk effekt: ${r.ecoeffect.level + 1}.`
        },

        get bscore() {
            console.log("##¤bscore expansionSpeed: " + r.expansionSpeed)
            return r.expansionSpeed >= 500 ? 3
                : r.expansionSpeed >= 160 ? 2
                : r.expansionSpeed >= 50 ? 1
                : r.expansionSpeed < 50 ? 0
                : 0 // ?
        },

        get blow() {
            const k = r.bmetodkey
            return k === "B2a" ?
                criterionLow(riskAssessment.critB)
            : r.expansionLowerQ >= 500 ? 3
            : r.expansionLowerQ >= 160 ? 2
            : r.expansionLowerQ >= 50 ? max(1, r.bscore - 1)
            : r.expansionLowerQ < 50 ? max(0, r.bscore - 1)
            : 1 // ?
        },

        get bhigh() {
            const k = r.bmetodkey
            const result = k === "B2a"
                ? criterionHigh(riskAssessment.critB)
                : r.expansionUpperQ >= 500 ? min(3, r.bscore + 1)
                : r.expansionUpperQ >= 160 ? min(2, r.bscore + 1)
                : r.expansionUpperQ >= 50 ? 1
                : r.expansionUpperQ < 50 ? 0
                : 1 // ?
                // console.log("#bhigh: " + r.bmetodkey + " expansionUpperQ: " + r.expansionUpperQ + " result: " + result)
                return result
            },
        get bDisabledUncertaintyValues() {
            console.log("uncarr B2a bDisabledUncertaintyValues " + r.bmetodkey)
            // return uncertaintyArray(r.blow, r.bhigh)
            const result = uncertaintyArray(r.blow, r.bhigh)
            console.log("uncarr B2a: " + r.blow + "!"  + r.bhigh + "!"  + JSON.stringify(result))
            return result

        },
        get expansionSpeed() {
            const k = r.bmetodkey
            console.log("##¤ expansionSpeed " + r.bmetodkey + " " + r.AOO10yrBest)
            const result =
                k === "B1" ? r.expansionSpeedInput
                : k === "B2a" ? r.AOOyear2 === 0 || r.AOOyear2 === null || r.AOOyear1 === 0 || r.AOOyear1 === null ? 0 : trunc(sqrt(r.AOOdarkfigureBest) * 1000 * (sqrt(r.AOO2) - sqrt(r.AOO1)) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                : k === "B2b" ? trunc(200 * (sqrt(r.AOO10yrBest / 4) - 1) / sqrt(pi))
                : 0 // ?
            console.log("#expspeed: " + k + " " + result)
            console.log("#expspeed data: " + JSON.stringify({
                AOOyear1: r.AOOyear1,
                AOOyear2: r.AOOyear2,
                AOO1: r.AOO1,
                AOO2: r.AOO2,
                AOOdarkfigureBest: r.AOOdarkfigureBest

            }))

            return roundToSignificantDecimals(result)
        },
        get expansionLowerQ() {
            const k = r.bmetodkey
            const result =
                k === "B1" ? r.expansionLowerQInput
                : k === "B2a" ? r.AOOyear2 === 0 || r.AOOyear2 === null || r.AOOyear1 === 0 || r.AOOyear1 === null ? 0 : trunc(sqrt(r.AOOdarkfigureLow) * 1000 * (sqrt(r.AOO2) - sqrt(r.AOO1)) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                : k === "B2b" ? trunc(200 * (sqrt(r.AOO10yrLow / 4) - 1) / sqrt(pi))
                : 0 // ?
            return roundToSignificantDecimals(result)
        },
        get expansionUpperQ() {
            const k = r.bmetodkey
            const result =
                k === "B1" ? r.expansionUpperQInput
                : k === "B2a" ? r.AOOyear2 === 0 || r.AOOyear2 === null || r.AOOyear1 === 0 || r.AOOyear1 === null ? 0 : trunc(sqrt(r.AOOdarkfigureHigh) * 1000 * (sqrt(r.AOO2) - sqrt(r.AOO1)) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                : k === "B2b" ? trunc(200 * (sqrt(r.AOO10yrHigh / 4) - 1) / sqrt(pi))
                : 0 // ?
            return roundToSignificantDecimals(result)
        },
        get AOOknown() {
            return adjustAOOInput(r.AOOknownInput)
        },
        get AOOtotalLow() {
            return adjustAOOInput(r.AOOtotalLowInput)
        },
        get AOOtotalBest() {
            return adjustAOOInput(r.AOOtotalBestInput)
        },
        get AOOtotalHigh() {
            return adjustAOOInput(r.AOOtotalHighInput)
        },
        get AOO50yrLow() {
            return adjustAOOInput(r.AOO50yrLowInput)
        },
        get AOO50yrBest() {
            return adjustAOOInput(r.AOO50yrBestInput)
        },
        get AOO50yrHigh() {
            return adjustAOOInput(r.AOO50yrHighInput)
        },

        get AOOdarkfigureBest() {
            const result =
                r.AOOknown === null || r.AOOknown === 0 ? 0
                : roundToSignificantDecimals2(r.AOOtotalBest / r.AOOknown )
            return result
        },
        get AOOdarkfigureLow() {
            const result =
                r.AOOknown === null || r.AOOknown === 0 ? 0
                : roundToSignificantDecimals2(r.AOOtotalLow / r.AOOknown )
            return result
        },
        get AOOdarkfigureHigh() {
            const result =
                r.AOOknown === null || r.AOOknown === 0 ? 0
                : roundToSignificantDecimals2(r.AOOtotalHigh / r.AOOknown )
            return result
        },
        get b2aresulttext() {
            return `Ekspansjonshastigheten er beregnet til ${r.expansionSpeed} m/år basert på økningen i artens forekomstareal i perioden fra ${r.AOOyear1} til ${r.AOOyear2} og et mørketall på ${r.AOOdarkfigureBest}.`
        },
        get b2bresulttext() {
            return `Basert på det beste anslaget på ${r.occurrences1Best} forekomster i løpet av 10 år og ${r.introductionsBest} introduksjon(er) i samme tidsperiode er B-kriteriet skåret som ${r.bscore + 1} (med usikkerhet: ${r.blow + 1}–${r.bhigh + 1}). Dette innebærer at artens ekspansjonshastighet ligger ${r.expansionText} (beste anslag: ${r.expansionSpeed} m/år).`
        },
        get expansionText() {
            return r.bscore === 0 ? "under 50 m/år"
                : r.bscore === 1 ? "mellom 50 m/år og 160 m/år"
                : r.bscore === 2 ? "mellom 160 m/år og 500 m/år"
                : r.bscore === 3 ? "over 500 m/år"
                : null
        }

    })
    autorun(() => {
        console.log("MedianLifetime: " + r.medianLifetime + " | " + r.medianLifetimeInput )
    })
    autorun(() => {
        console.log("ascore: " + r.ascore )
    })

    const ACriteriaSectionNames = [
        "LifespanA1aSimplifiedEstimate", // changed from  "SpreadPVAAnalysisEstimatedSpeciesLongevity" 11.07.21
        "SpreadRscriptEstimatedSpeciesLongevity",
        "ViableAnalysis"                                     // "RedListCategoryLevel"
    ]

    const BCriteriaSectionNames = [
        "SpreadYearlyIncreaseObservations",
        "SpreadYearlyIncreaseOccurrenceArea",
        "SpreadYearlyLiteratureData",
        "SpreadYearlyIncreaseCalculatedExpansionSpeed"
    ]
    // SpreadYearlyIncreaseEstimate - before

    function selectableSection(propName) {
        const isActive = riskAssessment["Active" + propName]
        // console.log(propName + " is" + (isActive ? "" : " not") + " active")
        const stringValue = riskAssessment["" + propName]
        const floatValue = extractFloat(stringValue)
        // console.log("floatValue: '" + floatValue + "' stringValue: " + stringValue)
        // const hasValue = 0 < floatValue
        const hasValue = 0 <= floatValue
        // console.log(propName + " has" + (hasValue ? "" : " no") + " value")
        return isActive && hasValue && stringValue
    }

    // create Selectable* observables
    // todo: trolig noe mobx som ikke virker her!!
    ACriteriaSectionNames.concat(BCriteriaSectionNames).map(tag => {
        const obj = {}
        obj["Selectable" + tag] = () => selectableSection(tag)
        extendObservable(riskAssessment, obj)
    })


    extendObservable(riskAssessment, {
        get ChosenSpreadYearlyIncreaseLevel() {
            const num = extractFloat(riskAssessment[riskAssessment.ChosenSpreadYearlyIncrease])
            const result = yearlyIncreaseLevel(num)
            return result
        },
    })

    extendObservable(riskAssessment, {
        get RedListCategoryLevel() {  //todo: should this be called "ViableAnalysisLevel"?
            const catstr = riskAssessment.redListCategory || ""
            const cat = catstr.trim().substring(0, 2).toUpperCase()
            const result = cat === "CR" ? 1 :
                            cat === "EN" ? 11 :
                            cat === "VU" ? 61 :
                            cat === "NT" ? 651 :
                            cat === "LC" ? 651 :
                            NaN
            return result
        }
    })

    autorun(() => {
        const k = r.ametodkey
        if(!(k === "A1a2" || k === "A1b2")) {
            // const criterionA = getCriterion(riskAssessment, 0, "A")
            const criterionA = riskAssessment.critA
            console.log("Autorun criterionA old value: " + criterionA.value)
            // const nv = riskAssessment.CalculatedCritALevel // .ChosenSpreadYearlyIncreaseLevel
            //   console.log("Autorun criterionA CalculatedCritALevel nv: " + JSON.stringify(nv))
            const avalue = r.ascore
            runInAction(() => {
                criterionA.value = avalue
            })
            console.log("Autorun criterionA new value: " + criterionA.value)
        }
    })

    autorun(() => {
        // const criterionB = getCriterion(riskAssessment, 0, "B")
        const criterionB = riskAssessment.critB
        console.log("Autorun criterionB old value: " + criterionB.value)
        const bvalue = r.bscore
        runInAction(() => {
            criterionB.value = bvalue
        })
        console.log("Autorun criterionB new value: " + criterionB.value)
    })

    autorun(() => {
        // const criterionC = getCriterion(riskAssessment, 0, "C")
        const criterionC = riskAssessment.critC
           console.log("Autorun criterionC .value: " + criterionC.value)
        const nv = riskAssessment.impactedNaturtypesColonizedAreaLevel
           console.log("Autorun criterionC new value: " + nv)
           console.log("Autorun criterionC not equal: " + (nv != criterionC.value))
           runInAction(() => {
               criterionC.value = nv
           })
    });

    autorun(() => {
        const sStr = riskAssessment.SpreadYearlyLiteratureDataExpansionSpeed
        const nStr = riskAssessment.SpreadYearlyLiteratureDataNumberOfIntroductionSources
        const s = extractFloat(sStr)
        const n = extractFloat(nStr)
        const v = s * Math.sqrt(n)
        const v2 = Math.round(v * 100) / 100
        // console.log("v2:" + v2)
        const val = isNaN(v2) ? "" : v2.toString()
        runInAction(() => {
            riskAssessment.SpreadYearlyLiteratureData = val
        })
    });
    autorun(() => {
        // const a = 5.77 // t*d*: use real value from vurdering.CurrentExistenceAreaCalculated
        const a =  riskAssessment.vurderingCurrentExistenceAreaCalculated
        const wStr = riskAssessment.SpreadYearlyIncreaseEstimate
        const w = extractFloat(wStr)
        // const v = 564 * (Math.sqrt(a + w) - Math.sqrt(a))
        const v = 564 * (Math.sqrt(a) - Math.sqrt(a - w))
        const v2 = Math.round(v * 100) / 100
        const val = isNaN(v2) ? "" : v2.toString()
        runInAction(() => {
            riskAssessment.SpreadYearlyIncreaseCalculatedExpansionSpeed = val
        })
    });

    reaction(
        () => r.AOOknown1,
        (AOOknown1, previousAOOknown1) => {
            const prevAOO1 = r.AOO1
            action(() => {
                r.AOO1 = AOOknown1
            })()
            console.log("#&#AOO1 updated from AOOknown1. old value:" + prevAOO1 + " new value: " + AOOknown1)
        }
    )
    reaction(
        () => r.AOOknown2,
        (AOOknown2, previousAOOknown2) => {
            const prevAOO2 = r.AOO2
            action(() => {
                r.AOO2 = AOOknown2
            })()
            console.log("#&#AOO2 updated from AOOknown2. old value:" + prevAOO2 + " new value: " + AOOknown2)
        }
    )
    reaction(
        () => r.riskLevelCode,
        (riskLevelCode, previousriskLevelCode) => {
            if (riskLevelCode == "NK") {
                action(() => {
                    r.possibleLowerCategory = "no";
                })()
            }
            console.log('#&#possibleLowerCategory is set to "no" because risklevelCode is "NK"')
        }
    )
}

function enhanceRiskAssessmentCrits(riskAssessment) {
    // function getCriterion(letter) {
    //     const result = riskAssessment.criteria.filter(c => c.criteriaLetter === letter)[0]; 
    //     return result;
    // }
    // riskAssessment.getCriterion = getCriterion
    extendObservable(riskAssessment, {
        critA: riskAssessment.getCriterion("A"),
        critB: riskAssessment.getCriterion("B"),
        critC: riskAssessment.getCriterion("C"),
        critD: riskAssessment.getCriterion("D"),
        critE: riskAssessment.getCriterion("E"),
        critF: riskAssessment.getCriterion("F"),
        critG: riskAssessment.getCriterion("G"),
        critH: riskAssessment.getCriterion("H"),
        critI: riskAssessment.getCriterion("I"),
    })
}



function enhanceRiskAssessmentComputedVurderingValues(riskAssessment, vurdering, artificialAndConstructedSites) {
    // autorun(() => vurdering.impactedNatureTypes.map(x => console.log("##!impactedNatureTypes code: " + x.niNCode )))
    // autorun(() => riskAssessment.redlistedNatureTypes.map(x => console.log("##!redlistedNatureTypes code: " + x.niNCode )))
    // autorun(() => riskAssessment.NiNNatureTypes.map(x => console.log("##!NiNNatureTypes code: " + x.niNCode )))

    // const artificialAndConstructedSites = ["F4", "F5", "H4", "L7", "L8", "M14", "M15", "T35", "T36", "T37", "T38", "T39", "T40", "T41", "T42", "T43", "T44", "T45", "V11", "V12", "V13"]

    

    extendObservable(riskAssessment, {
        get vurderingAlienSpeciesCategory() {return vurdering.alienSpeciesCategory},
        get vurderingCurrentExistenceAreaCalculated() {return vurdering.currentExistenceAreaCalculated},
        get vurderingAllImpactedNatureTypes() {return vurdering.impactedNatureTypes.map(x => x)},
        get redlistedNatureTypes() {return riskAssessment.vurderingAllImpactedNatureTypes.map(x => x).filter(x => !isNaN(x.niNCode))},
        get NiNNatureTypes() {return riskAssessment.vurderingAllImpactedNatureTypes.map(x => x).filter(x => isNaN(x.niNCode))},
        // critA: riskAssessment.getCriterion("A"),
        // critB: riskAssessment.getCriterion("B"),
        // critC: riskAssessment.getCriterion("C"),
        // critD: riskAssessment.getCriterion("D"),
        // critE: riskAssessment.getCriterion("E"),
        // critF: riskAssessment.getCriterion("F"),
        // critG: riskAssessment.getCriterion("G"),
        // critH: riskAssessment.getCriterion("H"),
        // critI: riskAssessment.getCriterion("I"),


        // C criteria
        get impactedNaturtypesColonizedAreaLevel() {
                const levels =  riskAssessment.vurderingAllImpactedNatureTypes
                    .filter(nt => !nonCountingNaturetypes.includes(getBaseNaturetypeCode(nt.niNCode)))
                    .map(nt => nt.colonizedArea)
                    .map(area =>
                    area === "0–2"? 0 :
                    area === "2-5"? 0 :
                    area === "5-10"? 1 :
                    area === "10-20"? 2 :
                    area === "20-50"? 3 :
                    area === "50-100"? 3 :
                    0
                )
                const maxlevel = Math.max(...levels, 0)
                return maxlevel
        },
        // F criteria
        get effectOnThreathenedNaturetypesLevel() {
            const levels = riskAssessment.redlistedNatureTypes.map(
                nt => nt.affectedArea
            ).map(area =>
                area === "0"? 0 :
                area === "0–2"? 1 :
                area === "2-5"? 2 :
                area === "5-10"? 3 :
                area === "10-20"? 3 :
                area === "20-50"? 3 :
                area === "50-100"? 3 :
                0
            )
            const maxlevel = Math.max(...levels, 0)
            return maxlevel

        },
        // G criteria
        get effectOnOtherNaturetypesLevel() {
            const levels = riskAssessment.NiNNatureTypes
            .filter(nt => !nonCountingNaturetypes.includes(getBaseNaturetypeCode(nt.niNCode)))
            .map(nt => nt.affectedArea)
            .map(area =>
                area === "0"? 0 :
                area === "0–2"? 0 :
                area === "2-5"? 0 :
                area === "5-10"? 1 :
                area === "10-20"? 2 :
                area === "20-50"? 3 :
                area === "50-100"? 3 :
                0
            )
            const maxlevel = Math.max(...levels, 0)
            return maxlevel
        },
    })
}

// -------------------------------------
export const critILevel = list => {
            const rlCats = ["LC","DD","NT"]
            const rlThreatCats = ["VU","EN","CR"]
            // const list = riskAssessment.HostParasiteInformations
            // list.map(item => {
            //     console.log("parasiteNewForHost type: " + typeof(item.parasiteNewForHost))
            //     console.log("parasiteNewForHost value: " + item.parasiteNewForHost)
            // })
            const list4 = list.filter(item =>
                item.parasiteIsAlien ||
                (rlThreatCats.indexOf(item.redListCategory) > -1 && item.parasiteNewForHost && !item.effectLocalScale) ||
                (rlCats.indexOf(item.redListCategory) > -1 && item.keyStoneSpecie && item.parasiteNewForHost && !item.effectLocalScale)
            )
            const list3 = list.filter(item =>
                !item.parasiteIsAlien &&
                (
                    (rlThreatCats.indexOf(item.redListCategory) > -1 && item.parasiteNewForHost && item.effectLocalScale) ||
                    (rlCats.indexOf(item.redListCategory) > -1 && item.keyStoneSpecie && item.parasiteNewForHost && item.effectLocalScale) ||
                    (rlCats.indexOf(item.redListCategory) > -1 && !item.keyStoneSpecie && item.parasiteNewForHost && !item.effectLocalScale)
                )
            )
            const list2 = list.filter(item =>
                !item.parasiteIsAlien &&
                (
                    (rlCats.indexOf(item.redListCategory) > -1 && !item.keyStoneSpecie && item.parasiteNewForHost && item.effectLocalScale) ||
                    (!item.parasiteNewForHost && !item.effectLocalScale)
                )
            )
            // console.log("list2 " + JSON.stringify(list2)   )
            // console.log("list3 " + JSON.stringify(list3)   )
            // console.log("list4 " + JSON.stringify(list4)   )


            const maxEffect4 = Math.max(...list4.map(item => parseInt(item.parasiteEcoEffect)))
            const maxEffect3 = Math.max(...list3.map(item => parseInt(item.parasiteEcoEffect)))
            const maxEffect2 = Math.max(...list2.map(item => parseInt(item.parasiteEcoEffect)))

            // console.log("maxeffect2 " + maxEffect2)
            // console.log("maxeffect3 " + maxEffect3)
            // console.log("maxeffect4 " + maxEffect4)


            // console.log("maxEffect4: " + maxEffect4)
            // console.log("maxEffect3: " + maxEffect3)
            // console.log("maxEffect2: " + maxEffect2)
            // const maxEffect4 = 3
            // const maxEffect3 = 3
            // const maxEffect2 = 3
            const effect4 = list4.length > 0 ? Math.min(4, maxEffect4) : 1
            const effect3 = list3.length > 0 ? Math.min(3, maxEffect3) : 1
            const effect2 = list2.length > 0 ? Math.min(2, maxEffect2) : 1
            const result = Math.max(effect4, effect3, effect2)
            // console.log("Ihostparasitelevel " + result)
            return result - 1;
        }
// -------------------------------------


function enhanceRiskAssessmentEcoEffect(riskAssessment) {
    extendObservable(riskAssessment, {
        get dThreathenedSpeciesLevel() {
            const threatenedCats = ["VU","EN","CR"]
            const otherRlCats = ["LC","DD","NT"]
            const isThreatened = cat => threatenedCats.indexOf(cat) > -1
            const isOther = cat => otherRlCats.indexOf(cat) > -1

            const fullSpeciesList = riskAssessment.speciesSpeciesInteractions
            const speciesList = fullSpeciesList.filter(item =>
                isThreatened(item.redListCategory) ||
                (isOther(item.redListCategory) && item.keyStoneSpecie))

            const speciesNaturtypeList = riskAssessment.speciesNaturetypeInteractions.filter(item =>
                item.keyStoneSpecie)
            const list = [].concat(speciesNaturtypeList).concat(speciesList)
            // console.log("runD nat:" + speciesNaturtypeList.length)
            // console.log("runD spec:" + speciesList.length)
            // console.log("runD:" + list.length)
            const result = list.filter(item =>
                    (item.effect === "Displacement") ||
                    (item.effect === "Moderate" && !item.effectLocalScale)).length > 0 ?
                4 :
                list.filter(item =>
                    (item.effect === "Moderate" && item.effectLocalScale) ||
                    (item.effect === "Weak" && !item.effectLocalScale) ).length > 0 ?
                3 :
                list.filter(item =>
                    (item.effect === "Weak" && item.effectLocalScale) ).length > 0 ?
                2 :
                1
            return result - 1;
        }
    });
    extendObservable(riskAssessment, {
        get EDomesticSpeciesLevel() {
            const otherRlCats = ["LC","DD","NT"]
            const fullSpeciesList = riskAssessment.speciesSpeciesInteractions
            const speciesList = fullSpeciesList.filter(item => otherRlCats.indexOf(item.redListCategory) > -1 && !item.keyStoneSpecie)
            // const speciesNaturtypeList = riskAssessment.SpeciesNaturetypeInteractions.map(x => x) // yeah - You need the map...
            // const speciesNaturtypeList = riskAssessment.SpeciesNaturetypeInteractions.filter(item => !item.keyStoneSpecie)
            const speciesNaturtypeList = riskAssessment.speciesNaturetypeInteractions.map(a => a) // changed 23.02.2017 - let all nature types count for E-criteria (email from Heidi Solstad)
            const list = [].concat(speciesNaturtypeList).concat(speciesList)
            // console.log("runE nat:" + speciesNaturtypeList.length)
            // console.log("runE spec:" + speciesList.length)
            // console.log("runE:" + list.length)

            // console.log("runE:" + list.length)
            const result = list.filter(item =>
                    item.effect === "Displacement" && !item.effectLocalScale).length > 0 ?

                    // (item.effect === "Displacement") ||
                    // // (item.effect === "Displacement" && item.keyStoneSpecie) ||
                    // (item.effect === "Displacement" && !item.keyStoneSpecie && !item.effectLocalScale) ||
                    // (item.effect === "Moderate" && item.keyStoneSpecie && !item.effectLocalScale)).length > 0 ?
                4 :
                list.filter(item =>
                    item.effect === "Displacement" && item.effectLocalScale).length > 0 ?
                    // (item.effect === "Displacement" && !item.keyStoneSpecie && item.effectLocalScale) ||
                    // (item.effect === "Moderate" && item.keyStoneSpecie && item.effectLocalScale) ||
                    // (item.effect === "Weak" && item.keyStoneSpecie && !item.effectLocalScale)).length > 0 ?
                3 :
                list.filter(item =>
                    item.effect === "Moderate" && !item.effectLocalScale).length > 0 ?
                    // (item.effect === "Moderate" && !item.keyStoneSpecie && !item.effectLocalScale) ||
                    // (item.effect === "Weak" && item.keyStoneSpecie && item.effectLocalScale)).length > 0 ?
                2 :
                1
            return result - 1;
        }
    });

    autorun(() => {
        // const criterionF = getCriterion(riskAssessment, 1, "F")
        const criterionF = riskAssessment.critF
          console.log("Autorun criterionF .value: " + criterionF.value)
        // const nv = riskAssessment.effectOnThreathenedNaturetypesLevel
        const nv = riskAssessment.effectOnThreathenedNaturetypesLevel
          console.log("Autorun criterionF new value: " + nv)
          console.log("Autorun criterionF not equal: " + (nv != criterionF.value))
        runInAction(() => {
            criterionF.value = nv
        })
    });

    autorun(() => {
        // const criterionG = getCriterion(riskAssessment, 1, "G")
        const criterionG = riskAssessment.critG
        console.log("Autorun criterionG .value: " + criterionG.value)
        const nv = riskAssessment.effectOnOtherNaturetypesLevel
          console.log("Autorun criterionG new value: " + nv)
          console.log("Autorun criterionG not equal: " + (nv != criterionG.value))
        runInAction(() => {
            criterionG.value = nv
        })
    });





    extendObservable(riskAssessment, {
        get HGeneticTransferLevel() {
            const rlCats = ["LC","DD","NT"]
            const rlThreatCats = ["VU","EN","CR"]
            const list = riskAssessment.geneticTransferDocumented
            const result = list.filter(item =>
                    !item.effectLocalScale &&
                        (item.keyStoneSpecie ||
                        (rlThreatCats.indexOf(item.redListCategory) > -1))).length > 0 ?
                4 :
                list.filter(item =>
                    (!item.effectLocalScale && !item.keyStoneSpecie && (rlCats.indexOf(item.redListCategory) > -1)) ||
                    (item.effectLocalScale && (rlThreatCats.indexOf(item.redListCategory) > -1)) ||
                    (item.effectLocalScale && item.keyStoneSpecie && (rlCats.indexOf(item.redListCategory) > -1))).length > 0 ?
                3 :
                list.filter(item =>
                    (item.effectLocalScale && !item.keyStoneSpecie && (rlCats.indexOf(item.redListCategory) > -1))).length > 0 ?
                2 :
                1
            return result - 1;
        }
    });
    extendObservable(riskAssessment, {
        get IHostParasiteLevel() {
            return critILevel(riskAssessment.hostParasiteInformations)
        }
    });
    autorun(() => {
        // const criterionD = getCriterion(riskAssessment, 1, "D")
        // console.log("Autorun criterionD: " + criterionD.value)
        const nv = riskAssessment.dThreathenedSpeciesLevel
        // console.log("Autorun criterionD nv: " + nv)
        runInAction(() => {
            riskAssessment.critD.value = nv
        })
    });
    autorun(() => {
        // const criterionE = getCriterion(riskAssessment, 1, "E")
        const nv = riskAssessment.EDomesticSpeciesLevel
        runInAction(() => {
            riskAssessment.critE.value = nv
        })
    });
    autorun(() => {
        // const criterionH = getCriterion(riskAssessment, 1, "H")
        runInAction(() => {
            riskAssessment.critH.value = riskAssessment.HGeneticTransferLevel
        })
    });
    autorun(() => {
        // const criterionI = getCriterion(riskAssessment, 1, "I")
        // console.log("Autorun criterionI: " + criterionI.value)
        const nv = riskAssessment.IHostParasiteLevel
        // console.log("Autorun criterionI nv: " + nv)
        runInAction(() => {
            riskAssessment.critI.value = nv
        })
    });
}

function enhanceRiskAssessmentLevel(riskAssessment, labels) {
    console.log("run enhanceRiskAssessmentLevel")
    extendObservable(riskAssessment, {
        get invationpotential() {
            const result = RiskLevel.invasjonspotensiale(riskAssessment)
            return result;
        },
        get ecoeffect () {
            const result = RiskLevel.ecoeffect(riskAssessment)
            return result;
        }
    });

    extendObservable(riskAssessment, {
        get riskLevelObj() {
            const result = RiskLevel.riskLevel(this.invationpotential, this.ecoeffect)
            return result;
        }
    });
    extendObservable(riskAssessment, {
        get riskLevel() {
            const result = this.riskLevelObj.level
            return result;
        }
    });
    extendObservable(riskAssessment, {
        get riskLevelText() {
            const levtxt = this.riskLevel.toString()
            const result = labels.RiskLevelText[levtxt]
            return result
        },
        get riskLevelCode() {
            const levtxt = this.riskLevel.toString()
            const result = labels.RiskLevelCode[levtxt]
            return result
        },
        get decisiveCriteria() {
            //console.log("##!decisiveCriteria: " + JSON.stringify(this.riskLevelObj))
            return this.riskLevelObj.decisiveCriteriaLabel
        }
    });
    console.log("end run enhanceRiskAssessmentLevel")

}

function enhanceCriteriaAddLabelsAndAuto(riskAssessment, codes) {
    // console.log("has CODES:" + JSON.stringify( codes))
    const axis = {A:0,B:0,C:0,D:1,E:1,F:1,G:1,H:1,I:1}


    for (const cr of codes.Criterion) {
        const crit = {}
        const levs = []
        const letter = cr.Value

        console.log("Crit>: " + letter)
        for (const levdef of cr.Children["Crit" + letter]) {
            const lev = {
                value: Number(levdef.Value),
                text: levdef.Text
            }
            // console.log("-" + JSON.stringify( lev))
            levs.push(lev)
        }
        crit.heading = cr.Text
        crit.info = cr.Info
        crit.codes = levs

        // const criteria = getCriterion(riskAssessment, axis[letter], letter)
        const criteria = riskAssessment.getCriterion(letter)
        Object.assign(criteria, crit)

        // extendObservable(criteria, {currentValueLabel: computed(function() {
        //     const v = criteria.value
        //     const result = criteria.codes[v]
        //     console.log("Curr crit value: " + criteria.criteriaLetter+ v+result)
        //     return result
        // })})
        extendObservable(criteria, {
            get currentValueLabel() {
                const v = this.value
                const result = this.codes[v].text
                console.log("Curr crit value: " + this.criteriaLetter+ v + result)
                return result
            }
        })
    }
}


function setUncertaintyValues(isFirstrun, crit, uvalues) {

    if (!isFirstrun) {
        // The first run is done during page load
        // We want to keep the saved uncertainty values!
        // Successive calls should automatically set uncertainty when value changes
        // NB! Careless changes to the application may cause this code to run multiple times during page load
        // Take care this does not happen! (uncomment the trace() function to trace the problem if necassary)

        console.log("#¤#uncertainty nextrun: " + crit.criteriaLetter + " : " + crit.value)
        arrayConditionalReplace(crit.uncertaintyValues, uvalues)

    } else {
        // added 27.2.2017
        // In the hope that this does not mess tings up
        // this code is introduced to update illegal uncertainty values that
        // are introduced when criteria rules are changed
        // This functionality is also dependent on a well working "firstrun"; se comment above
        // e.g. the criteria must not have a default value that is updated from db after the first run!

        // console.log("#¤#uncertainty firstrun1 : " + crit.criteriaLetter )
        console.log("#¤#uncertainty firstrun: " + crit.criteriaLetter + " : " + crit.value + " - " + JSON.stringify(crit.uncertaintyValues))
        if (crit.uncertaintyValues.indexOf(crit.value) <= -1 ) {
            // console.log("rectify uncertainties")
            // crit.uncertaintyValues.replace(uvalues)
            arrayConditionalReplace(crit.uncertaintyValues, uvalues)
        }

    }
}

function extdendCriteriaProps(crit) {
    extendObservable(crit, {
        valueDisabled: observable([]),
        uncertaintyDisabled: observable([]),
        get majorUncertainty() { return crit.uncertaintyValues.length >= 3}
    })
}


function enhanceCriteriaAddUncertaintyRules(riskAssessment) {
    const r = riskAssessment
    for(const crit of [r.critA]) {  // just to get scope
        let firstrun = true
        extdendCriteriaProps(crit)
        autorun(() => {
            console.log("#¤# autorun crit" + crit.criteriaLetter + " value: " + crit.value)
            let ud // uncertaintyDisabled 
            let uv // uncentaintyValues (selected by program)
            let vd // valuesDisabled (only some values/levels is alowed)
            let auto // value is selected by program

            if (riskAssessment.ametodkey === "A1a1" || riskAssessment.ametodkey === "A1b1") {
                vd = []
                ud = [0,1,2,3]
                uv = []

                for (var i = 0; i <= 3; i++) {
                    if(i >= riskAssessment.alow && i <= riskAssessment.ahigh) {
                        uv.push(i)
                    }
                }
                auto = true
            } else if (riskAssessment.ametodkey === "A1a2" || riskAssessment.ametodkey === "A1b2") {
                vd = []
                uv = []
                ud = []
                console.log("#¤# critA apossible: "+ riskAssessment.apossibleLow + " " + riskAssessment.apossibleHigh )
                console.log("#¤# critA alowhigh: "+ riskAssessment.alow + " " + riskAssessment.ahigh )
                console.log("#¤# critA ascore: "+ riskAssessment.ascore )

                for (var i = 0; i <= 3; i++) {
                    if(i < riskAssessment.apossibleLow || i > riskAssessment.apossibleHigh) {
                        vd.push(i)
                    }
                    if(i < (riskAssessment.ascore - 1) || i > (riskAssessment.ascore + 1)) {
                        ud.push(i)
                    }
                }
                uv = uncertaintyArrayAddValue(filterUncertaintyArray(crit.uncertaintyValues, uncertaintyArrayReverse(ud)), riskAssessment.ascore)

                //         r.reasonForAdjustmentCritA !== null &&
                //         r.reasonForAdjustmentCritA.length > 2) {
                auto = false
            } else if (riskAssessment.ametodkey === "A3") {
                vd = []
                ud = [0,1,2,3]
                uv = []
                for (var i = 0; i <= 3; i++) {
                    if(i >= riskAssessment.alow && i <= riskAssessment.ahigh) {
                        uv.push(i)
                    }
                }
                auto = true
            } else {

                vd = []
                ud = []
                for (let n = 0; n < 4 ; n++) {
                    if (Math.abs(n - crit.value) > 1 || n === crit.value) {
                        ud.push(n)
                    }
                }
                uv = [crit.value]

            }
            runInAction(() => {
                setUncertaintyValues(firstrun, crit, uv)
                arrayConditionalReplace(crit.valueDisabled, vd)
                arrayConditionalReplace(crit.uncertaintyDisabled, ud)
                crit.auto = auto
                if (vd.includes(crit.value)) {
                    crit.value = riskAssessment.apossibleLow
                }
                // console.log("#¤# uncertainty1 : " + crit.criteriaLetter )
                // console.log("#¤# uncertainty : " + crit.criteriaLetter + " : " + crit.value + " - " + JSON.stringify(crit.uncertaintyValues)  + " + " + JSON.stringify(crit.uncertaintyDisabled))
            })
            firstrun = false
            if (!config.isRelease) trace()  // leave this line here! Se comments above to learn when to uncomment.
       })

    }

    for(const crit of [r.critB]) { // just to get scope
        autorun(() => {
            const auto = (riskAssessment.bmetodkey === "B1" || riskAssessment.bmetodkey === "B2b")
            runInAction(() => {
                crit.auto = auto
                // auto={                riskAssessment.chosenSpreadYearlyIncrease == "a" ||                                                      assessment.alienSpeciesCategory == "DoorKnocker"} 
                // disabled={disabled || riskAssessment.chosenSpreadYearlyIncrease == "a" || (riskAssessment.chosenSpreadYearlyIncrease == "b" && assessment.alienSpeciesCategory == "DoorKnocker")}
            })
        })

        let firstrun = true
        extdendCriteriaProps(crit)
        autorun(() => {
            console.log("#¤# autorun crit" + crit.criteriaLetter + " value: " + crit.value)
            let ud // uncertaintyDisabled 
            let uv // uncentaintyValues (selected by program)
            let vd // valuesDisabled (only some values/levels is alowed)

            if (riskAssessment.bmetodkey === "B1" || riskAssessment.bmetodkey === "B2b") {
                // console.log("#¤%bhigh set uv, key: " + riskAssessment.bmetodkey)
                vd = []
                ud = [0,1,2,3]
                uv = []
                for (var i = 0; i <= 3; i++) {
                    if(i >= riskAssessment.blow && i <= riskAssessment.bhigh) {
                        uv.push(i)
                    }
                }
                // console.log("#¤#bhigh set uv "+ JSON.stringify(uv))
            } else if (riskAssessment.ametodkey === "B2a") {
                // console.log("#¤%bhigh set uv, key: " + riskAssessment.bmetodkey)
                vd = []
                ud = riskAssessment.bDisabledUncertaintyValues
                uv = [crit.value]

            } else {

                vd = []
                ud = []
                for (let n = 0; n < 4 ; n++) {
                    if (Math.abs(n - crit.value) > 1 || n === crit.value) {
                        ud.push(n)
                    }
                }
                uv = [crit.value]
            }
            runInAction(() => {
                setUncertaintyValues(firstrun, crit, uv)
                arrayConditionalReplace(crit.valueDisabled, vd)
                arrayConditionalReplace(crit.uncertaintyDisabled, ud)
                if (vd.includes(crit.value)) {
                    crit.value = riskAssessment.apossibleLow
                }
                // console.log("#¤# uncertainty1 : " + crit.criteriaLetter )
                // console.log("#¤# uncertainty : " + crit.criteriaLetter + " : " + crit.value + " - " + JSON.stringify(crit.uncertaintyValues)  + " + " + JSON.stringify(crit.uncertaintyDisabled))
            })
            firstrun = false
            if (!config.isRelease) trace()  // leave this line here! Se comments above to learn when to uncomment.
       })
    }



    for(const crit of [r.critC, r.critD, r.critE, r.critF, r.critG, r.critH, r.critI]) {
        runInAction(() => {
            crit.auto = !["C", "F", "G"].includes(crit.criteriaLetter)
        })

        let firstrun = true
        extdendCriteriaProps(crit)
        autorun(() => {
            // console.log("#¤# autorun crit" + crit.criteriaLetter + " value: " + crit.value)
            const ud = []
            for (let n = 0; n < 4 ; n++) {
                if (Math.abs(n - crit.value) > 1 || n === crit.value) {
                    ud.push(n)
                }
            }
            runInAction(() => {
                arrayConditionalReplace(crit.uncertaintyDisabled, ud)
            })
        })
        autorun(() => {
            // console.log("#¤# autorun crit" + crit.criteriaLetter + " value: " + crit.value)
            const uv = [crit.value]
            runInAction(() => {
                setUncertaintyValues(firstrun, crit, uv)
            })
            firstrun = false
            //if (!config.isRelease) trace()  // leave this line here! Se comments above to learn when to uncomment.
        })
    }
    autorun(() => {console.log("#¤# critA value**: " + riskAssessment.critA.value + " | " + riskAssessment.ascore)})
}

// function enhanceCriteriaAddErrorReportingForAutoMode(riskAssessment) {
//     for(const crit of riskAssessment.criteria) {
//         extendObservable(crit, errorhandler)
//     }
// }


export default function enhanceCriteria(riskAssessment, vurdering, codes, labels, artificialAndConstructedSites) {
    function getCriterion(letter) {
        const result = riskAssessment.criteria.filter(c => c.criteriaLetter === letter)[0]; 
        return result;
    }
    riskAssessment.getCriterion = getCriterion
    enhanceCriteriaAddLabelsAndAuto(riskAssessment, codes)
    enhanceRiskAssessmentCrits(riskAssessment)
    // enhanceRiskAssessmentAddErrorReportingHandler(riskAssessment)
    // enhanceCriteriaAddErrorReportingForAutoMode(riskAssessment)
    enhanceRiskAssessmentComputedVurderingValues(riskAssessment, vurdering, artificialAndConstructedSites)
    enhanceRiskAssessmentLevel(riskAssessment, labels)
    enhanceRiskAssessmentEcoEffect(riskAssessment)
    enhanceRiskAssessmentInvasjonspotensiale(riskAssessment)
    enhanceCriteriaAddUncertaintyRules(riskAssessment)
    //enhanceCriteriaAddScale(riskAssessment)
    //enhanceCriteriaAddStatus(riskAssessment)
}

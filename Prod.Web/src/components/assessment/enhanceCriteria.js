import {action, autorun, computed, extendObservable, observable, observe, isObservableArray, runInAction, remove, set, trace} from 'mobx';
import RiskLevel from './riskLevel';
import {extractFloat, getCriterion} from '../../utils'
import { EventNote } from '@material-ui/icons';
import config from 'config';

function round(num){return Math.round(num)}
function min(num1,num2){return Math.min(num1,num2)}
function max(num1,num2){return Math.max(num1,num2)}
function sqrt(num){return Math.sqrt(num)}
const pi = Math.PI
function roundToSignificantDecimals(num) {
    // console.log("run roundToSignificantDecimals")
    const result = 
        (num >= 9950000) ? round(num / 1000000) * 1000000 :
        (num >= 995000 ) ? round(num / 100000)  * 100000  :
        (num >= 99500  ) ? round(num / 10000)   * 10000   :
        (num >= 9950   ) ? round(num / 1000)    * 1000    :
        (num >= 995    ) ? round(num / 100)     * 100     :
        (num >= 100    ) ? round(num / 10)      * 10      :
        num 
    return result
}
function roundToSignificantDecimals2(num) {   // todo: spør om grenseverdiene (100 vs 99.5, og 2(?))
    const result = 
        // (num >= 9950000) ? round(num / 1000000) * 1000000 :
        // (num >= 995000 ) ? round(num / 100000)  * 100000  :
        // (num >= 99500  ) ? round(num / 10000)   * 10000   :
        // (num >= 9950   ) ? round(num / 1000)    * 1000    :
        // (num >= 995    ) ? round(num / 100)     * 100     :
        // (num >= 100    ) ? round(num / 10)      * 10      :
        (num >= 99.5    ) ? round(num / 10)      * 10      :
        (num >= 9.95    ) ? round(num / 1)       * 1      :
        (num >= 2    ) ? round(num / 0.1)      * 0.1      :
        (num <  2    ) ? round(num / 0.01)      * 0.01      :
        num 
    return result
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
function medianLifespanLevel(num) {
    const result = 
        num >= 650 ? 3
        : num >= 60 ? 2
        : num >= 10 ? 1
        : 0
    return result
}

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
    var i = 0
    for(key of keys) {
        if(best >= key) {
            i = key
            break
        }
    }
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

const errorhandler = {
    errors: {},
    get hasErrors() {
        return Object.keys(this.errors).length > 0 
    },
    addError({id, errorText}) {
        if(typeof(id) !== 'string' || typeof(id) !== 'string' ) {
            console.warn("addError wrong data type")
            
        }
        if (!(id in this.errors)) {
            set(this.errors, id)
            // this.errors[id] = errorText
        }
    },
    removeError(id) {
        if(typeof(id) !== 'string') {
            console.warn("removeError wrong data type")
        }
        if (id in this.errors) {
            // this.errors[id] = undefined
            remove(this.errors, id)
        }
    }
}


function enhanceRiskAssessmentAddErrorReportingHandler(riskAssessment) {
        extendObservable(riskAssessment, errorhandler)
}



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
    extendObservable(riskAssessment, {
        get ametodkey() {
            const method = riskAssessment.chosenSpreadMedanLifespan
            const a1submethod = r.acceptOrAdjustCritA
            const result = 
                method === "LifespanA1aSimplifiedEstimate" 
                ? a1submethod === "accept" 
                    ? "A1a" // "AOOaccept"  // "forekomstareal forenklet"
                    : "A1b" // "AOOadjusted", // "forekomstareal justert"
                : method === "SpreadRscriptEstimatedSpeciesLongevity"
                ? "A2"
                : method === "ViableAnalysis"
                ? "A3"
                : ""
            return result
        },
        get bmetodkey() {
            const method = riskAssessment.chosenSpreadYearlyIncrease
            const result = 
                method === "a" 
                ? "B1"
                : method === "b"
                ? "B2a"
                : method === "c"
                ? "B2b"
                : ""
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
        get AOO10yrBest() {return 4 * ((1 + r.Occurrences1Best) * (1 + round(r.IntroductionsBest) / 2) - 1) },
        get AOO10yrLow() { return 4 * ((1 + r.Occurrences1Low) * (1 + r.IntroductionsLow / 2) - 1) },
        get AOO10yrHigh() {return 4 * ((1 + r.Occurrences1High) * (1 + r.IntroductionsHigh / 2) - 1) },

        get AOOchangeBest() { return r.AOOtotalBest < 4 ? 1 : n0(r.AOO50yrBest) / d1(r.AOOtotalBest) },
        get AOOchangeLow() { return r.AOOtotalBest < 4 ? 1 : n0(r.AOO50yrLow) / d1(r.AOOtotalBest) },
        get AOOchangeHigh() { return r.AOOtotalBest >= 4 ? 1 : n0(r.AOO50yrHigh) / d1(r.AOOtotalBest) },
        get adefaultBest() { 
            return r.AOO50yrBest < 4 ? 0 
            : r.AOO50yrBest >= 4 ? 1 
            : r.AOO50yrBest >= 8 && r.AOOchangeBest > 0.2 ? 2
            : r.AOO50yrBest >= 20 && r.AOOchangeBest > 0.05 ? 2
            : r.AOO50yrBest >= 20 && r.AOOchangeBest > 0.2 ? 3
            : 0 // null?
        },
        get adefaultLow() {
            return r.AOO50yrLow < 4 ? max(0, r.adefaultBest - 1) 
            : r.AOO50yrLow >= 4 ? max(1, r.adefaultBest - 1) 
            : r.AOO50yrLow >= 8 && r.AOOchangeLow > 0.2 ? 2
            : r.AOO50yrLow >= 20 && r.AOOchangeLow > 0.05 ? 2 
            : r.AOO50yrLow >= 20 && r.AOOchangeLow > 0.2 ? 3 
            : 0 // null?
        },
        get adefaultHigh() {
            return r.AOO50yrHigh < 4 ? 0
            : r.AOO50yrHigh >= 4 ? 1
            : r.AOO50yrHigh >= 8 && r.AOOchangeHigh > 0.2 ? min(2, r.adefaultBest + 1) 
            : r.AOO50yrHigh >= 20 && r.AOOchangeHigh > 0.05 ?  min(2, r.adefaultBest + 1) 
            : r.AOO50yrHigh >= 20 && r.AOOchangeHigh > 0.2 ?  min(3, r.adefaultBest + 1) 
            : 0 // null?
        },
        get apossibleLow() {
            return (r.AOO50yrBest > 80 && r.AOOchangeBest > 1) ? 3
            : (r.AOO50yrBest >= 20 & r.AOOchangeBest > 0.2) ? 2
            : (r.AOO50yrBest >= 4) ? 1
            : 0
        },

        get apossibleHigh() { 
            return (r.AOO50yrBest < 4) ? 1
            : (r.AOO50yrBest < 20 & r.AOOchangeBest <= 0.05) ? 2
            : 3
        },
        get ascore() {
            const k = r.ametodkey
            console.log("ascore method: " + k)
            return k.startsWith("A1") ? r.adefaultBest 
            : r.medianLifetime >= 650 ? 3
            : r.medianLifetime >= 60 ? 2
            : r.medianLifetime >= 10 ? 1 
            : r.medianLifetime < 10 ? 0
            : 0
        },
        get alow() {
            const k = r.ametodkey
            return k.startsWith("A1") ? r.adefaultLow 
            : k === "A2" || k === "A3" ?
                r.lifetimeLowerQ >= 650 ? 3 :
                r.lifetimeLowerQ >= 60 ? 2 :
                r.lifetimeLowerQ >= 10 ? max(1, r.ascore - 1)  :
                r.lifetimeLowerQ < 10 ? max(0, r.ascore - 1)  :
                0
            : 0 // 1 / NaN?
        },
        get ahigh() {
            const k = r.ametodkey 
            return k.startsWith("A1") ? r.adefaultHigh
            : k === "A2" || k === "A3" ?
                r.lifetimeLowerQ >= 650 ? min(3, r.ascore + 1) :
                r.lifetimeLowerQ >= 60 ? min(2, r.ascore + 1) :
                r.lifetimeLowerQ >= 10 ? 1 :
                r.lifetimeLowerQ < 10 ? 0 :
                0
            : 0 // 1 / NaN?
        },
        get medianLifetime() {
            const k = r.ametodkey
            return k.startsWith("A1") ? 
                r.ascore === 0 ? 3
                : r.ascore === 1 ? 25
                : r.ascore === 2 ? 200
                : r.ascore === 3 ? 2000
                : 0
            : roundToSignificantDecimals(r.medianLifetimeInput)
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
            //return `Basert på de beste anslagene på forekomstareal i dag (${r.AOOtotalBest + 1}&nbsp;km²) og om 50&nbsp;år (${r.AOO50yrBest + 1}&nbsp;km²) er A-kriteriet forhåndsskåret som ${r.adefaultBest + 1} (med usikkerhet: ${r.adefaultLow}–${r.adefaultHigh}). Dette innebærer at artens mediane levetid ligger ${r.lifetimeText}, eller at sannsynligheten for utdøing innen 50&nbsp;år er på ${r.extinctionText}.`
            return `Basert på de beste anslagene på forekomstareal i dag (${r.AOOtotalBest + 1} km²) og om 50 år (${r.AOO50yrBest + 1} km²) er A-kriteriet forhåndsskåret som ${r.adefaultBest + 1} (med usikkerhet: ${r.adefaultLow}–${r.adefaultHigh}). Dette innebærer at artens mediane levetid ligger ${r.lifetimeText}, eller at sannsynligheten for utdøing innen 50 år er på ${r.extinctionText}.`
        },

        get a1bresulttext() {
            //return `Basert på de beste anslagene på forekomstareal i dag (${r.AOOtotalBest + 1}&nbsp;km²) og om 50&nbsp;år (${r.AOO50yrBest + 1}&nbsp;km²) er A-kriteriet forhåndsskåret som ${r.adefaultBest + 1} (med usikkerhet: ${r.adefaultLow}–${r.adefaultHigh}). Dette innebærer at artens mediane levetid ligger ${r.lifetimeText}, eller at sannsynligheten for utdøing innen 50&nbsp;år er på ${r.extinctionText}.`
            return `Basert på det beste anslaget på ${r.AOOtotalBest + 1} forekomst(er) i løpet av 10 år og ${r.AOO50yrBest + 1} introduksjon(er) i samme tidsperiode er A-kriteriet forhåndsskåret som ${r.adefaultBest + 1} (med usikkerhet: ${r.adefaultLow}–${r.adefaultHigh}). Dette innebærer at artens mediane levetid ligger ${r.lifetimeText}, eller at sannsynligheten for utdøing innen 50 år er på ${r.extinctionText}.`
        },


        get bscore() {
            return r.expansionSpeed >= 500 ? 3
            : r.expansionSpeed >= 160 ? 2
            : r.expansionSpeed >= 50 ? 1
            : r.expansionSpeed < 50 ? 0
            : 1 // ?
        },

        get blow() {
            return r.expansionLowerQ >= 500 ? 3
            : r.expansionLowerQ >= 160 ? 2
            : r.expansionLowerQ >= 50 ? max(1, r.bscore - 1)
            : r.expansionLowerQ < 50 ? max(0, r.bscore - 1)
            : 1 // ?
        },

        get bhigh() {
            return r.expansionUpperQ >= 500 ? min(3, r.bscore + 1) 
            : r.expansionUpperQ >= 160 ? min(2, r.bscore + 1) 
            : r.expansionUpperQ >= 50 ? 1 
            : r.expansionUpperQ < 50 ? 0
            : 1 // ?
        },
        get expansionSpeed() {
            const k = r.bmetodkey
            const result = 
                k === "B1" ? r.expansionSpeedInput
                : k === "B2a" ? r.AOOyear2 === 0 || r.AOOyear2 === null || r.AOOyear1 === 0 || r.AOOyear1 === null ? 0 : round(sqrt(r.AOOdarkfigureBest) * (sqrt(r.AOO2) - sqrt(r.AOO1)) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi))) 
                : k === "B2b" ? round(200 * (sqrt(r.AOO10yrBest / 4) - 1) / sqrt(pi))
                : 0 // ?
            return roundToSignificantDecimals(result)
        },
        get expansionLowerQ() {
            const k = r.bmetodkey
            const result = 
                k === "B1" ? r.expansionLowerQInput
                : k === "B2b" ? round(200 * (sqrt(r.AOO10yrLow / 4) - 1) / sqrt(pi)) 
                : 0 // ?
            return roundToSignificantDecimals(result)
        },
        get expansionUpperQ() {
            const k = r.bmetodkey
            const result = 
                k === "B1" ? r.expansionUpperQInput
                : k === "B2b" ? round(200 * (sqrt(r.AOO10yrHigh / 4) - 1) / sqrt(pi)) 
                : 0 // ?
            return roundToSignificantDecimals(result)
        },
        get AOOdarkfigureBest() {            
            const result = 
                r.AOOknown === null || r.AOOknown === 0 ? 0 
                : roundToSignificantDecimals2(r.AOOtotalBest / r.AOOknown )
            return result
        },
        get b2aresulttext() {
            return `Ekspansjonshastigheten er beregnet til ${r.expansionSpeed} m/år basert på økningen i artens forekomstareal i perioden fra ${r.AOOyear1} til ${r.AOOyear2} og et mørketall på ${r.AOOdarkfigureBest}.`
        },
        get b2bresulttext() {
            return `Basert på det beste anslaget på ${r.occurrences1Best} forekomst(er) i løpet av 10 år og ${r.introductionsBest} introduksjon(er) i samme tidsperiode er B-kriteriet skåret som ${r.bscore + 1} (med usikkerhet: ${r.blow + 1}–${r.bhigh + 1}). Dette innebærer at artens ekspansjonshastighet ligger ${r.expansionText} (beste anslag: ${r.expansionSpeed} m/år).`
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
        
    autorun(() => {
        if (r.lifetimeLowerQ > r.medianLifetime) {
            r.addError("A3err1", "Levetidens nedre kvartil må være mindre enn medianen.")
        } else {
            r.removeError("A3err1")
        }
    })
        
    autorun(() => {
        if (r.LifetimeUpperQ <= r.medianLifetime) {
            r.addError("A3err2", "Levetidens nedre kvartil må være mindre enn medianen.")
        } else {
            r.removeError("A3err2")
        }
    })
        
    autorun(() => {
        if (r.expansionLowerQ > r.expansionSpeed) {
            r.addError("B1err1", "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen.")
        } else {
            r.removeError("B1err1")
        }
    })
        
    autorun(() => {
        if (r.expansionUpperQ <= r.expansionSpeed) {
            r.addError("B1err2", "Ekspansjonshastighetens øvre kvartil må være større enn medianen.")
        } else {
            r.removeError("B1err2")
        }
    })

    const ec = observable({
        warnings: [],

        // A1
        // get lifespanA1aSimplifiedEstimateValue () {
        //     console.log("* * * run A1 * * * ")
        //     //amethod = "forekomstareal" 
        //     const r = riskAssessment
        //     runInAction(() => {
        //         if( r.acceptOrAdjustCritA === "accept") { 
        //         } else if (r.acceptOrAdjustCritA === "adjust") {
        //             // amethod = "forekomstareal justert" 
        //             // "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
        //             // Valgbare bokser for beste anslag er skårene fra og med apossibleLow til og med apossibleHigh. 
        //             // Krysset i boksene bestemmer verdien til ascore (mellom 1 og 4). 
        //             // Valgbare bokser for usikkerhet er skårene fra og med max(1, ascore - 1) til og med min(4, ascore + 1). 
        //             // Det laveste krysset i boksene bestemmer verdien til alow (mellom 1 og 4). 
        //             // Det høyeste krysset i boksene bestemmer verdien til ahigh (mellom 1 og 4). 
            
            
        //         } else {
        //             console.error("lifespanA1aSimplifiedEstimateValue acceptOrAdjustCritA illegal value: " + r.acceptOrAdjustCritA)
        //         }
        //     })
        //     return {
        //         method: r.acceptOrAdjustCritA === "accept" 
        //             ? "AOOaccept"  // "forekomstareal forenklet",
        //             :  "AOOadjusted", // "forekomstareal justert",
        //         level: levelFloor(r.ascore),
        //         high: levelFloor(r.ahigh),
        //         low: levelFloor(r.alow),
        //         text: r.a1aresulttext
        //     }
        // },
        // A2
        // get spreadRscriptEstimatedSpeciesLongevityValue () {
        //     console.log("* * * run A2 * * * ")

        //     const r = riskAssessment
        //     const result = {
        //         method: "numerisk estimering",
        //         level: r.ascore,
        //         high: 3,
        //         low: 1
        //         // text: "dummytext"
        //     }
        //     return result
        // },
        // A3
        // get viableAnalysisValue () {
        //     console.log("* * * run A3 * * * ")

        //     const r = riskAssessment

        //     // if (r.lifetimeLowerQ > r.medianLifetime) 
        //     //     return {error: "Levetidens nedre kvartil må være mindre enn medianen."}
        //     // if (r.LifetimeUpperQ <= r.medianLifetime) 
        //     //     return {error: "Levetidens øvre kvartil må være større enn medianen."}

        //     const result = {
        //         method: "levedyktighetsanalyse",
        //         level: r.ascore,
        //         high: r.ahigh,
        //         low: r.alow
        //         // text: "dummytext"
        //     }
        //     return result
        // },

        
        // get B1 () {
        //     console.log("* * * run B1 * * * ")
        //     const r = riskAssessment
        //     // if (r.expansionLowerQ > r.expansionSpeed)
        //     //     return {error:  "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen."}
        //     // if (r.expansionUpperQ <= r.expansionSpeed) 
        //     //     return {error: "Ekspansjonshastighetens øvre kvartil må være større enn medianen."}
        //     const result = {
        //         method: "modellering",
        //         level: r.bscore,
        //         high: r.bhigh,
        //         low: r.blow
        //     }
        //     return result
        // },

        // get B2a () {
        //     console.log("* * * run B2a * * * ")
        //     const r = riskAssessment
        //     const result = {
        //         method: "modellering",
        //         level: r.bscore,
        //         high: r.bhigh,
        //         low: r.blow,
        //         text: r.b2aresulttext
        //     }
        //     return result
        // },

        // get B2b () {
        //     console.log("* * * run B2b * * * ")
        //     const r = riskAssessment
        //     const result = {
        //         method: "introduksjonspress",
        //         level: r.bscore,
        //         high: r.bhigh,
        //         low: r.blow,
        //         text: r.b2bresulttext
        //     }
        //     return result
        // }
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
        // SpreadYearlyLiteratureDataExpansionSpeed: "", // todo: remove this when domain is updated
        // SpreadYearlyIncreaseCalculatedExpansionSpeed: "", // todo: remove this when domain is updated
        // // // get ChosenSpreadMedanLifespanLevel() {
        // // //     const num = extractFloat(riskAssessment[riskAssessment.ChosenSpreadMedanLifespan])
        // // //     const result = medianLifespanLevel(num)
        // // //     return result
        // // // },

        


        get ChosenSpreadYearlyIncreaseLevel() {
            const num = extractFloat(riskAssessment[riskAssessment.ChosenSpreadYearlyIncrease])
            const result = yearlyIncreaseLevel(num)
            return result
        },

        // get CalculatedCritALevel() {
        //     console.log("CalculatedCritALevel")
        //     const method = riskAssessment.chosenSpreadMedanLifespan
        //     console.log("CalculatedCritALevel method " + method)
        //     const result = 
        //         method === "LifespanA1aSimplifiedEstimate" 
        //         ? ec.lifespanA1aSimplifiedEstimateValue
        //         : method === "SpreadRscriptEstimatedSpeciesLongevity"
        //         ? ec.spreadRscriptEstimatedSpeciesLongevityValue
        //         : method === "ViableAnalysis"
        //         ? ec.viableAnalysisValue
        //         : NaN

        //     // const result = aresult.level
        //     console.log("CalculatedCritALevel result " + JSON.stringify(result))

        //     return result
        // },
        // get CalculatedCritBLevel() {
        //     const method = riskAssessment.chosenSpreadYearlyIncrease
        //     const result = 
        //         method === "a" 
        //         ? ec.B1
        //         : method === "b"
        //         ? ec.B2a
        //         : method === "c"
        //         ? ec.B2b
        //         : NaN
        //     return result
        // },
    })

    // observe the Selectable* observables to make shure that the chosen method/section does not point to a not selectable method/section
    /* ACriteriaSectionNames.map(tag =>
        observe(riskAssessment, "Selectable" + tag, (newValue, oldValue) => {
            if(!newValue) {
                if (riskAssessment.ChosenSpreadMedanLifespan === tag) {
                    setTimeout(action(() => {
                        riskAssessment.ChosenSpreadMedanLifespan = ""
                    }), 100) 
                }
            }
        })
    )
    BCriteriaSectionNames.map(tag =>
        observe(riskAssessment, "Selectable" + tag, (newValue, oldValue) => {
            if(!newValue) {
                if (riskAssessment.ChosenSpreadYearlyIncrease === tag) {
                    setTimeout(action(() => {
                        riskAssessment.ChosenSpreadYearlyIncrease = ""
                    }), 100) 
                }
            }
        })
    )*/

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

    // autorun(() => {
    //     if (r.AOOtotalLow > r.AOOtotalBest) 
    //         return {error: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget."} 
    //     if (r.AOOtotalHigh < r.AOOtotalBest) 
    //         return {error: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget."}
    //     if (r.AOO50yrLow > r.AOO50yrBest) 
    //         return {error: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget."}
    //     if (r.AOO50yrHigh < r.AOO50yrBest) 
    //         return {error: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget."}
    //     if (r.AOOtotalLow == r.AOOknown) 
    //         warnings.push("Er det realistisk at det ikke eksisterer noen uoppdagede forekomster av arten?") 
    //     if (r.AOOtotalLow < r.AOOknown) 
    //         warnings.push("Er det korrekt at artens totale nåværende forekomstareal kan være mindre enn det kjente?") 
    //     if (AOO50yrBest < AOOtotalBest) 
    //         warnings.push("Er det korrekt at det er forventet en nedgang i artens forekomstareal i løpet av de neste 50&nbsp;år?") 
    

    // })


    // autorun(() => {
    //     const criterionA = getCriterion(riskAssessment, 0, "A")
    //     console.log("Autorun criterionA : " + JSON.stringify(Object.keys(criterionA)));
    //     //console.log("Autorun criterionA ra: " + JSON.stringify(Object.keys(riskAssessment)));
    //     console.log("Autorun criterionA level: " + criterionA.value + typeof(riskAssessment) + typeof(riskAssessment.CalculatedCritALevel));
    //     console.log("CalculatedCritALevel: "); // + typeof(riskAssessment.CalculatedCritALevel))
    //     const nv = riskAssessment.CalculatedCritALevel //ChosenSpreadMedanLifespanLevel
    //     console.log("Autorun criterionA nv: " + JSON.stringify(nv))
    //     if (nv.method !== "AOOadjusted") { // only set criterion value (automatically) when certain amethods is used
    //         runInAction(() => {
    //             criterionA.value = nv.level
    //         })
    //     }
    // });

    autorun(() => {
        const criterionA = getCriterion(riskAssessment, 0, "A")
          console.log("Autorun criterionA old value: " + criterionA.value)
        // const nv = riskAssessment.CalculatedCritALevel // .ChosenSpreadYearlyIncreaseLevel
        //   console.log("Autorun criterionA CalculatedCritALevel nv: " + JSON.stringify(nv))
        const avalue = r.ascore 
        runInAction(() => {
            criterionA.value = avalue
        })
        console.log("Autorun criterionA new value: " + criterionA.value)

    });

    autorun(() => {
        const criterionB = getCriterion(riskAssessment, 0, "B")
        console.log("Autorun criterionB old value: " + criterionB.value)
        const bvalue = r.bscore 
        runInAction(() => {
            criterionB.value = bvalue
        })
        console.log("Autorun criterionB new value: " + criterionB.value)
    });

    autorun(() => {
        const criterionC = getCriterion(riskAssessment, 0, "C")
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
}

function enhanceRiskAssessmentComputedVurderingValues(riskAssessment, vurdering, artificialAndConstructedSites) {

    // const artificialAndConstructedSites = ["F4", "F5", "H4", "L7", "L8", "M14", "M15", "T35", "T36", "T37", "T38", "T39", "T40", "T41", "T42", "T43", "T44", "T45", "V11", "V12", "V13"]

    extendObservable(riskAssessment, {
        get vurderingCurrentExistenceAreaCalculated() {return vurdering.currentExistenceAreaCalculated},

        get vurderingAllImpactedNatureTypes() {return vurdering.impactedNatureTypes.map(x => x)},
        get vurderingImpactedNaturalNatureTypes() { return vurdering.impactedNatureTypes.filter(
            nt => !artificialAndConstructedSites.filter(code => nt.niNCode === code || nt.niNCode.startsWith(code + "-") ).length > 0
        // ).filter(
        //     nt => !nt.NiNCode.startsWith("AM-") // Sverige
        ).filter(
            nt => !nt.niNCode.startsWith("LI ")
        )},

        // C criteria
        get impactedNaturtypesColonizedAreaLevel() {
                const levels =  riskAssessment.vurderingImpactedNaturalNatureTypes.map(nt => nt.colonizedArea).map(area =>
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
        // G criteria
        get effectOnOtherNaturetypesLevel() {
            const levels = riskAssessment.vurderingImpactedNaturalNatureTypes.map(nt => nt.affectedArea).map(area =>
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
        // F criteria
        get effectOnThreathenedNaturetypesLevel() {
            const levels = vurdering.redlistedNatureTypes.map(
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

        // redlistedNaturtypesCategoryLevels: () => {
        //         const info = vurdering.RedlistedNatureTypes.map(nt => {return {cat: nt.Category.replace('°', ''), area: nt.AffectedArea}} )
        //         return info
        // }
    })
    // const rllevel = (rntlevels, redlistcats) => {
    //     const levels = rntlevels.filter(rnt => redlistcats.indexOf(rnt.cat) > -1).map(rnt => rnt.area).map(area => 
    //         area === "0"? 0 :
    //         area === "0–2"? 1 :
    //         area === "2-5"? 2 :
    //         area === "5-10"? 3 :
    //         area === "10-20"? 3 :
    //         area === "20-50"? 3 :
    //         area === "50-100"? 3 :
    //         0
    //     )
    //     const maxlevel = Math.max(...levels, 0)
    //     return maxlevel
    // } 
    // extendObservable(riskAssessment, {
    //     // effectOnThreathenedNaturetypesLevel: () => {
    //     //     const threatenedlevels = ["CR","EN","VU","Sjelden"]
    //     //     const level = rllevel(riskAssessment.redlistedNaturtypesCategoryLevels, threatenedlevels)
    //     //     return level
    //     // },
    //     // effectOnOtherNaturetypesLevel: () => {
    //     //     const otherlevels = ["LC","DD","NT"]
    //     //     const level = rllevel(riskAssessment.redlistedNaturtypesCategoryLevels, otherlevels)
    //     //     return level
    //     // }
    // })
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
        const criterionF = getCriterion(riskAssessment, 1, "F")
          console.log("Autorun criterionF .value: " + criterionF.value)
        const nv = riskAssessment.effectOnThreathenedNaturetypesLevel
          console.log("Autorun criterionF new value: " + nv)
          console.log("Autorun criterionF not equal: " + (nv != criterionF.value))
        runInAction(() => {
            criterionF.value = nv
        })
    });

    autorun(() => {
        const criterionG = getCriterion(riskAssessment, 1, "G")
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
        const criterionD = getCriterion(riskAssessment, 1, "D")
        // console.log("Autorun criterionD: " + criterionD.value)
        const nv = riskAssessment.dThreathenedSpeciesLevel
        // console.log("Autorun criterionD nv: " + nv)
        runInAction(() => {
            criterionD.value = nv
        })
    });
    autorun(() => {
        const criterionE = getCriterion(riskAssessment, 1, "E")
        const nv = riskAssessment.EDomesticSpeciesLevel
        runInAction(() => {
            criterionE.value = nv
        })
    });
    autorun(() => {
        const criterionH = getCriterion(riskAssessment, 1, "H")
        runInAction(() => {
            criterionH.value = riskAssessment.HGeneticTransferLevel
        })
    });
    autorun(() => {
        const criterionI = getCriterion(riskAssessment, 1, "I")
        // console.log("Autorun criterionI: " + criterionI.value)
        const nv = riskAssessment.IHostParasiteLevel
        // console.log("Autorun criterionI nv: " + nv)
        runInAction(() => {
            criterionI.value = nv
        })
    });
}

function enhanceRiskAssessmentLevel(riskAssessment, labels) {
    // extendObservable(riskAssessment, {
    //     _invasjonspotensialeLevel: RiskLevel.invasjonspotensiale(riskAssessment)
    // });
    extendObservable(riskAssessment, {
        get invasjonspotensialeLevel() {
            const result = RiskLevel.invasjonspotensiale(riskAssessment)
            return result;
        }
    });
    autorun(() => {
        //todo: something must be wrong here (?)
        
        //try {
        const {level, decisiveCriteria, uncertaintyLevels} = riskAssessment.invasjonspotensialeLevel
        //const {level, decisiveCriteria, uncertaintyLevels} = riskAssessment.invationPotentialLevel
        console.log("_invasjonspotensialeLevel changed: " + level)
        runInAction(() => {
            riskAssessment.invationPotentialLevel = level
            riskAssessment.invationPotentialUncertaintyLevels = uncertaintyLevels
        })
        //}
        //catch (e) {}
    });
    // extendObservable(riskAssessment, {
    //     _ecoeffectLevel: RiskLevel.ecoeffect(riskAssessment)
    // });

    extendObservable(riskAssessment, {
        get ecoeffectLevel () {
            const result = RiskLevel.ecoeffect(riskAssessment)
            return result;
        }
    });

    autorun(() => {
        //try {
        
        const {level, decisiveCriteria, uncertaintyLevels} = riskAssessment.ecoeffectLevel
        console.log("ecoeffectlevel changed: " + level)
        runInAction(() => {
            riskAssessment.ecoEffectLevel = level
            riskAssessment.ecoEffectUncertaintyLevels = uncertaintyLevels
        })
        //}
        //catch (e) {}
    });

    delete riskAssessment.riskLevel  //todo: Check if necessary (or the correct way to do this) ?????  Basically: risklevel is observable from db data, but we want it to be a computed observable!
    
    extendObservable(riskAssessment, {
        get riskLevel() {
            const result = RiskLevel.riskLevel(riskAssessment.invationPotentialLevel, riskAssessment.ecoEffectLevel, riskAssessment.decisiveCriteria)
            
            //const result = RiskLevel.riskLevel(riskAssessment.invasjonspotensialeLevel, riskAssessment.ecoeffectLevel)
            return result;
        }
    });
    
     autorun(() => {
        const level = riskAssessment.riskLevel
        const decisiveCriteriaLabel = riskAssessment.decisiveCriteria
        console.log("risklevel changed: " + level + " | " + decisiveCriteriaLabel)
      /* 
        
        const levtxt = level.toString()

        riskAssessment.riskLevel = level
        
        riskAssessment.riskLevelCode = labels.RiskLevelCode[levtxt]
        riskAssessment.riskLevelText = labels.RiskLevelText[levtxt]
        riskAssessment.decisiveCriteria = decisiveCriteriaLabel*/
     });
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
        crit.auto = true

        const criteria = getCriterion(riskAssessment, axis[letter], letter)
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


function enhanceCriteriaAddUncertaintyRules(riskAssessment) {
    function uncertaintylevelsFor(baseAttributeName, levelfunc) {
        // medianLifespanLevel
        // yearlyIncreaseLevel
        const maxDistanecFromValue = 1

        const valuenum =  extractFloat(riskAssessment[baseAttributeName])        
        const value =  levelfunc(valuenum)

        const lowstr = riskAssessment[baseAttributeName + "LowerQuartile"]
        const highstr = riskAssessment[baseAttributeName + "UpperQuartile"]
        const lownum = lowstr ? extractFloat(lowstr) : valuenum
        const highnum = highstr ? extractFloat(highstr) : valuenum
        const lowlevel = levelfunc(lownum)
        const highlevel = levelfunc(highnum)
        const lowadjusted = Math.min(value, Math.max(value - maxDistanecFromValue, lowlevel ))
        const highadjusted = Math.max(value, Math.min(value + maxDistanecFromValue, highlevel ))
        // console.log("B uncertaintylevel:" + lowlevel + "|" + highlevel)
        // console.log("B adjuncertaintylevel:" + lowadjusted + "|" + highadjusted)

        const uncertainties = [];
        for (var i = lowadjusted; i <= highadjusted; i++) {
            uncertainties.push(i);
        }
        // console.log("B uncertainties:" + JSON.stringify(uncertainties))

        return uncertainties

    }

    for(const crit of riskAssessment.criteria) { 
        let firstrun = true
        extendObservable(crit, {
            uncertaintyDisabled: observable([]),
            get majorUncertainty() { return crit.uncertaintyValues.length >= 3}
        })
        autorun(() => {
            const maxDistanecFromValue = 1
            const value = crit.value
            let ud
            let uv
            if (crit.criteriaLetter === "A" && 
                    riskAssessment.chosenSpreadMedanLifespan === 'LifespanA1aSimplifiedEstimate' 
            ) {
                const ulevels = uncertaintylevelsFor(riskAssessment.chosenSpreadMedanLifespan, medianLifespanLevel)
                uv = ulevels
                ud = [0,1,2,3]
            } else if (crit.criteriaLetter === "B" && 
                    (riskAssessment.chosenSpreadYearlyIncrease === 'SpreadYearlyIncreaseOccurrenceArea' || 
                    riskAssessment.chosenSpreadYearlyIncrease === 'SpreadYearlyIncreaseObservations')
            ) {
                const ulevels = uncertaintylevelsFor(riskAssessment.chosenSpreadYearlyIncrease, yearlyIncreaseLevel)
                uv = ulevels
                ud = [0,1,2,3]
            } else {    

                ud = []
                for (let n = 0; n < 4 ; n++) {
                    if (Math.abs(n - value) > maxDistanecFromValue || n === value) {
                        ud.push(n)
                    } 
                }
                uv = [value]

            }
            runInAction(() => {
                    if (!firstrun) {
                        // The first run is done during page load
                        // We want to keep the saved uncertainty values!
                        // Successive calls should automatically set uncertainty when value changes
                        // NB! Careless changes to the application may cause this code to run multiple times during page load 
                        // Take care this does not happen! (uncomment the trace() function to trace the problem if necassary)

                        // console.log("nextrun: " + crit.criteriaLetter + " : " + crit.value)
                        
                        crit.uncertaintyValues.replace(uv)
                    } else {
                        // added 27.2.2017
                        // In the hope that this does not mess tings up
                        // this code is introduced to update illegal uncertainty values that
                        // are introduced when criteria rules are changed
                        // This functionality is also dependent on a well working "firstrun"; se comment above
                        // e.g. the criteria must not have a default value that is updated from db after the first run!

                        // console.log("firstrun: " + crit.criteriaLetter + " : " + crit.value + " - " + JSON.stringify(crit.uncertaintyValues))
                        if (crit.uncertaintyValues.indexOf(value) <= -1 ) {
                            // console.log("rectify uncertainties")
                            crit.uncertaintyValues.replace(uv)
                        }

                    }
                    crit.uncertaintyDisabled.replace(ud)
            })
            firstrun = false
            if (!config.isRelease) trace()  // leave this line here! Se comments above to learn when to uncomment.
       })
    }
}

function enhanceCriteriaAddErrorReportingForAutoMode(riskAssessment) {
    for(const crit of riskAssessment.criteria) { 
        extendObservable(crit, errorhandler)
    }
}


export default function enhanceCriteria(riskAssessment, vurdering, codes, labels, artificialAndConstructedSites) {
    enhanceRiskAssessmentAddErrorReportingHandler(riskAssessment)
    enhanceCriteriaAddErrorReportingForAutoMode(riskAssessment)
    enhanceRiskAssessmentComputedVurderingValues(riskAssessment, vurdering, artificialAndConstructedSites)
    enhanceRiskAssessmentLevel(riskAssessment, labels)
    enhanceCriteriaAddLabelsAndAuto(riskAssessment, codes)
    enhanceRiskAssessmentEcoEffect(riskAssessment)
    enhanceRiskAssessmentInvasjonspotensiale(riskAssessment)
    enhanceCriteriaAddUncertaintyRules(riskAssessment)
}

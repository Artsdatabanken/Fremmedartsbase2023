import {action, autorun, computed, extendObservable, observable, observe, isObservableArray, runInAction, transaction, whyRun} from 'mobx';
import RiskLevel from './riskLevel';
import {extractFloat, getCriterion} from '../../utils'



// function getCriterion(riskAssessment, akse, letter) {
//     const result = riskAssessment.criteria.filter(c => c.akse === akse && c.criteriaLetter === letter)[0]; 
//     return result;
// }




function round(num){return Math.round(num)}
function min(num1,num2){return Math.min(num1,num2)}
function max(num1,num2){return Math.max(num1,num2)}
function sqrt(num){return Math.sqrt(num)}
const pi = Math.PI
function roundToSignificantDecimals(num) {
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
    const result = num >= 500 ?
        3 :
        num >= 160 ?
        2 :
        num >= 50 ?
        1 :
        0
    // const result = num >= 250 ?
    //     3 :
    //     num >= 100 ?
    //     2 :
    //     num >= 40 ?
    //     1 :
    //     0
    return result
}
function medianLifespanLevel(num) {
    const result = num >= 650 ?
        3 :
        num >= 60 ?
        2 :
        num >= 10 ?
        1 :
        0
    return result
}

function levelFloor(level) {
    return level === NaN
    ? NaN
    : typeof(level) === "number"
    ? level - 1
    : NaN
}

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





function enhanceRiskAssessmentInvasjonspotensiale(riskAssessment) {
    const ec = observable({
        // A1
        get lifespanA1aSimplifiedEstimateValue () {
            //amethod = "forekomstareal" 
            const r = riskAssessment

            const AOOchangeBest = r.AOOtotalBest < 4 ? 1 : n0(r.AOO50yrBest) / d1(r.AOOtotalBest)
            const AOOchangeLow = r.AOOtotalBest < 4 ? 1 : n0(r.AOO50yrLow) / d1(r.AOOtotalBest)
            const AOOchangeHigh = r.AOOtotalBest >= 4 ? 1 : n0(r.AOO50yrHigh) / d1(r.AOOtotalBest)
        
            var adefaultBest = 0 // null
            if (r.AOO50yrBest < 4) adefaultBest = 1 
            if (r.AOO50yrBest >= 4) adefaultBest = 2 
            if (r.AOO50yrBest >= 8 && AOOchangeBest > 0.2) adefaultBest = 3 
            if (r.AOO50yrBest >= 20 && AOOchangeBest > 0.05) adefaultBest = 3 
            if (r.AOO50yrBest >= 20 && AOOchangeBest > 0.2) adefaultBest = 4 
        
            var adefaultLow = 0 // null
            if (r.AOO50yrLow < 4) adefaultLow = max(1, adefaultBest - 1) 
            if (r.AOO50yrLow >= 4) adefaultLow = max(2, adefaultBest - 1) 
            if (r.AOO50yrLow >= 8 && AOOchangeLow > 0.2) adefaultLow = 3 
            if (r.AOO50yrLow >= 20 && AOOchangeLow > 0.05) adefaultLow = 3 
            if (r.AOO50yrLow >= 20 && AOOchangeLow > 0.2) adefaultLow = 4 
        
            var adefaultHigh = 0 // null
            if (r.AOO50yrHigh < 4) adefaultHigh = 1 
            if (r.AOO50yrHigh >= 4) adefaultHigh = 2 
            if (r.AOO50yrHigh >= 8 && AOOchangeHigh > 0.2) adefaultHigh = min(3, adefaultBest + 1) 
            if (r.AOO50yrHigh >= 20 && AOOchangeHigh > 0.05) adefaultHigh = min(3, adefaultBest + 1) 
            if (r.AOO50yrHigh >= 20 && AOOchangeHigh > 0.2) adefaultHigh = min(4, adefaultBest + 1) 
        
        
            var lifetimeText = null
            var extinctionText = null
            if (r.adefaultBest == 1) {
                lifetimeText = "under 10&nbsp;år" 
                extinctionText = "over 97&nbsp;%" 
            }
            if (r.adefaultBest == 2) {
                lifetimeText = "mellom 10&nbsp;år og 60&nbsp;år" 
                extinctionText = "mellom 43&nbsp;% og 97&nbsp;%" 
            }
            if (r.adefaultBest == 3) {
                lifetimeText = "mellom 60&nbsp;år og 650&nbsp;år" 
                extinctionText = "mellom 5&nbsp;% og 43&nbsp;%" 
            }
            if (r.adefaultBest == 4) {
                lifetimeText = "over 650&nbsp;år" 
                extinctionText = "under 5&nbsp;%"
            }
        
            var apossibleLow = null
            apossibleLow = 
                (r.AOO50yrBest > 80 && AOOchangeBest > 1) ? 4 :
                (r.AOO50yrBest >= 20 & AOOchangeBest > 0.2) ? 3 :
                (r.AOO50yrBest >= 4) ? 2 : 
                1
        
            var apossibleHigh = null
            apossibleHigh =
                (r.AOO50yrBest < 4) ? 2 :
                (r.AOO50yrBest < 20 & AOOchangeBest <= 0.05) ? 3 : 
                4 
        
            // // // // Utmating 
            // const a1aresulttext = `Basert på de Dummy xxx`
            const a1aresulttext = `Basert på de beste anslagene på forekomstareal i dag (${r.AOOtotalBest}&nbsp;km²) og om 50&nbsp;år (${r.AOO50yrBest}&nbsp;km²) er A-kriteriet forhåndsskåret som ${adefaultBest} (med usikkerhet: ${adefaultLow}–${adefaultHigh}). Dette innebærer at artens mediane levetid ligger ${lifetimeText}, eller at sannsynligheten for utdøing innen 50&nbsp;år er på ${extinctionText}.`
        


            // Resten av beregninga er avhengig av radioknappen som velges nedenfor teksten: 
            var ascore = adefaultBest 
            var alow = adefaultLow 
            var ahigh = adefaultHigh 
            var medianLifetime = NaN
            if( r.acceptOrAdjustCritA === "accept") { 
                // amethod = "forekomstareal forenklet" 
                medianLifetime = 
                    ascore === 1 ? 3 :
                    ascore === 2 ? 25 :
                    ascore === 3 ? 200 :
                    ascore === 4 ? 2000 :
                    NaN
                return {
                    amethod: "AOOaccept", // "forekomstareal forenklet",
                    level: levelFloor(ascore),
                    high: levelFloor(ahigh),
                    low: levelFloor(alow),
                    text: a1aresulttext
                }
            } else if (r.acceptOrAdjustCritA === "adjust") {
                // amethod = "forekomstareal justert" 
                // "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
                // Valgbare bokser for beste anslag er skårene fra og med apossibleLow til og med apossibleHigh. 
                // Krysset i boksene bestemmer verdien til ascore (mellom 1 og 4). 
                // Valgbare bokser for usikkerhet er skårene fra og med max(1, ascore - 1) til og med min(4, ascore + 1). 
                // Det laveste krysset i boksene bestemmer verdien til alow (mellom 1 og 4). 
                // Det høyeste krysset i boksene bestemmer verdien til ahigh (mellom 1 og 4). 
        
                medianLifetime = // Samme som i "forekomstareal forenklet"!
                    ascore === 1 ? 3 :
                    ascore === 2 ? 25 :
                    ascore === 3 ? 200 :
                    ascore === 4 ? 2000 :
                    NaN
                return {
                        amethod: "AOOadjusted", // "forekomstareal justert",
                        level: NaN,
                        high: levelFloor(ahigh),
                        low: levelFloor(alow),
                        text: a1aresulttext
                    }
        
            } else {
                console.error("lifespanA1aSimplifiedEstimateValue acceptOrAdjustCritA illegal value: " + r.acceptOrAdjustCritA)
            }
        },
        // A2
        get spreadRscriptEstimatedSpeciesLongevityValue () {
            const r = riskAssessment
            runInAction(() => {                
                r.ascore = 
                r.medianLifetime >= 650 ? 4 :
                r.medianLifetime >= 60 ? 3 :
                r.medianLifetime >= 10 ? 2 :
                r.medianLifetime < 10 ? 1 :
                NaN
            
                // avrunding til to signifikante desimaler: 
                r.medianLifetime = roundToSignificantDecimals(r.medianLifetime)
            })
            const result = {
                method: "numerisk estimering",
                level: r.ascore,
                high: 3,
                low: 1
                // text: "dummytext"
            }
            return result
        },
        // A3
        get viableAnalysisValue () {
            const r = riskAssessment

            if (r.lifetimeLowerQ > r.medianLifetime) 
                return {error: "Levetidens nedre kvartil må være mindre enn medianen."}
            if (r.LifetimeUpperQ <= r.medianLifetime) 
                return {error: "Levetidens øvre kvartil må være større enn medianen."}
            
            runInAction(() => {                
                r.ascore = 
                    r.medianLifetime >= 650 ? 4 :
                    r.medianLifetime >= 60 ? 3 :
                    r.medianLifetime >= 10 ? 2 :
                    r.medianLifetime < 10 ? 1 :
                    NaN
                
                r.alow = 
                    r.lifetimeLowerQ >= 650 ? 4 :
                    r.lifetimeLowerQ >= 60 ? 3 :
                    r.lifetimeLowerQ >= 10 ? max(2, r.ascore - 1)  :
                    r.lifetimeLowerQ < 10 ? max(1, r.ascore - 1)  :
                    NaN
                
                r.ahigh = 
                    r.lifetimeLowerQ >= 650 ? min(4, r.ascore + 1) :
                    r.lifetimeLowerQ >= 60 ? min(3, r.ascore + 1) :
                    r.lifetimeLowerQ >= 10 ? 2 :
                    r.lifetimeLowerQ < 10 ? 1 :
                    NaN
                
                // avrunding til to signifikante desimaler: 
                r.medianLifetime = roundToSignificantDecimals(r.medianLifetime)
                r.lifetimeLowerQ = roundToSignificantDecimals(r.lifetimeLowerQ)  // todo: check! denne forandrer inputvariablen!?
                r.LifetimeUpperQ = roundToSignificantDecimals(r.LifetimeUpperQ)  // todo: check! denne forandrer inputvariablen!?
            })
            


            const result = {
                method: "levedyktighetsanalyse",
                level: r.ascore,
                high: r.ahigh,
                low: r.alow
                // text: "dummytext"
            }
            return result
        },

        
        get B1 () {
            const r = riskAssessment
            if (r.expansionLowerQ > r.expansionSpeed)
                return {error:  "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen."}
            if (r.expansionUpperQ <= r.expansionSpeed) 
                return {error: "Ekspansjonshastighetens øvre kvartil må være større enn medianen."}
            runInAction(() => {                
                r.bscore = 
                    (r.expansionSpeed >= 500) ? 4 :
                    (r.expansionSpeed >= 160) ? 3 :
                    (r.expansionSpeed >= 50) ? 2 :
                    (r.expansionSpeed < 50) ? 1 :
                    NaN
            
                r.blow =
                    (r.expansionLowerQ >= 500) ? 4 :
                    (r.expansionLowerQ >= 160) ? 3 :
                    (r.expansionLowerQ >= 50) ? max(2, bscore - 1) :
                    (r.expansionLowerQ < 50) ? max(1, bscore - 1) :
                    NaN
            
                r.bhigh =
                    (r.expansionUpperQ >= 500) ? min(4, bscore + 1) :
                    (r.expansionUpperQ >= 160) ? min(3, bscore + 1) :
                    (r.expansionUpperQ >= 50) ? 2 :
                    (r.expansionUpperQ < 50) ? 1 :
                    NaN
                // avrunding til to signifikante desimaler: 
                r.expansionSpeed = roundToSignificantDecimals(r.expansionSpeed) // ???!
                r.expansionLowerQ = roundToSignificantDecimals(r.expansionLowerQ) // ???!
                r.expansionUpperQ = roundToSignificantDecimals(r.expansionUpperQ) // ???!
            })                   

            const result = {
                method: "modellering",
                level: r.bscore,
                high: r.bhigh,
                low: r.blow
            }
            return result
        },

        get B2a () {
            const r = riskAssessment
            runInAction(() => {                
                r.AOOdarkfigureBest = roundToSignificantDecimals2(r.AOOdarkfigureBest)
                r.expansionSpeed = round(sqrt(r.AOOdarkfigureBest) * (sqrt(r.AOO2) - sqrt(r.AOO1)) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi))) 
                r.bscore =
                    (r.expansionSpeed >= 500) ? 4 :
                    (r.expansionSpeed >= 160) ? 3 :
                    (r.expansionSpeed >= 50) ? 2 :
                    (r.expansionSpeed < 50) ? 1 :
                    Nan
                r.expansionSpeed = roundToSignificantDecimals(r.expansionSpeed)
            })
            // Utmating 
            const b2aresulttext = `Ekspansjonshastigheten er beregnet til ${r.expansionSpeed}&nbsp;m/år basert på økningen i artens forekomstareal i perioden fra ${r.AOOyear1} til ${r.AOOyear2} og et mørketall på ${r.AOOdarkfigureBest}.`

            const result = {
                method: "modellering",
                level: r.bscore,
                high: r.bhigh,
                low: r.blow,
                text: b2aresulttext
            }
            return result
        },

        get B2b () {
            const r = riskAssessment
            runInAction(() => {                
                r.expansionSpeed = round(200 * (sqrt(r.AOO10yrBest / 4) - 1) / sqrt(pi)) 
                r.expansionLowerQ = round(200 * (sqrt(r.AOO10yrLow / 4) - 1) / sqrt(pi)) 
                r.expansionUpperQ = round(200 * (sqrt(r.AOO10yrHigh / 4) - 1) / sqrt(pi)) 
                r.bscore =
                    (r.expansionSpeed >= 500) ? 4 :
                    (r.expansionSpeed >= 160) ? 3 :
                    (r.expansionSpeed >= 50) ? 2 :
                    (r.expansionSpeed < 50) ? 1 :
                    Nan
                r.blow =
                    (r.expansionLowerQ >= 500) ? 4 :
                    (r.expansionLowerQ >= 160) ? 3 :
                    (r.expansionLowerQ >= 50) ? max(2, r.bscore - 1) :
                    (r.expansionLowerQ < 50) ? max(1, r.bscore - 1) :
                    NaN
                r.bhigh =  // todo: check with Hanno. his code sets blow here!! That must be wrong!!
                    (r.expansionUpperQ >= 500) ? min(4, r.bscore + 1) :
                    (r.expansionUpperQ >= 160) ? min(3, r.bscore + 1) :
                    (r.expansionUpperQ >= 50) ? 2 :
                    (r.expansionUpperQ < 50) ? 1 :
                    NaN
                r.expansionText =
                    r.bscore === 1 ? "under 50&nbsp;m/år" :
                    r.bscore === 2 ? "mellom 50&nbsp;m/år og 160&nbsp;m/år"  :
                    r.bscore === 3 ? "mellom 160&nbsp;m/år og 500&nbsp;m/år" :
                    r.bscore === 4 ? "over 500&nbsp;m/år" :
                    null
                // avrunding til to signifikante desimaler: 
                r.expansionSpeed = roundToSignificantDecimals(r.expansionSpeed)
            })
            // Utmating 
            const b2bresulttext = `Basert på det beste anslaget på ${r.occurrences1Best} forekomster i løpet av 10&nbsp;år og ${r.introductionsBest} introduksjoner innen 50&nbsp;år er B-kriteriet skåret som ${bscore} (med usikkerhet: £{blow}–${bhigh}). Dette innebærer at artens ekspansjonshastighet ligger ${expansionText} (beste anslag: ${expansionSpeed}&nbsp;m/år).`

            const result = {
                method: "introduksjonspress",
                level: r.bscore,
                high: r.bhigh,
                low: r.blow,
                text: b2bresulttext
            }
            return result
        }
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

        // medianLifetime: 0,
        amethod: null,
        ascore: 0,
        ahigh: 0,
        alow:0,
        bmethod: null,
        bscore: 0,
        bhigh: 0,
        blow:0,

        bCritMCount: "",
        bCritExact: "",
        bCritP: "",
        bCritNewObs: "",

        AOOdarkfigureBest: 0,
        AOOdarkfigureLow: 0,
        AOOdarkfigureHigh: 0,
        AOO10yrBest: 0,
        AOO10yrHigh: 0,
        AOO10yrLow: 0,
        


        get CalculatedCritALevel() {
            const method = riskAssessment.chosenSpreadMedanLifespan
            const result = 
                method === "LifespanA1aSimplifiedEstimate" 
                ? ec.lifespanA1aSimplifiedEstimateValue
                : method === "SpreadRscriptEstimatedSpeciesLongevity"
                ? ec.spreadRscriptEstimatedSpeciesLongevityValue
                : method === "ViableAnalysis"
                ? ec.viableAnalysisValue
                : NaN

            // const result = aresult.level

            return result
        },
        get ChosenSpreadYearlyIncreaseLevel() {
            const num = extractFloat(riskAssessment[riskAssessment.ChosenSpreadYearlyIncrease])
            const result = yearlyIncreaseLevel(num)
            return result
        },
        get CalculatedCritBLevel() {
            const method = riskAssessment.chosenSpreadYearlyIncrease
            const result = 
                method === "a" 
                ? ec.B1
                : method === "b"
                ? ec.B2a
                : method === "c"
                ? ec.B2b
                : NaN
            return result
        },
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

    autorun(() => {
        const criterionA = getCriterion(riskAssessment, 0, "A")
        // console.log("Autorun criterionA: " + criterionA.value)
        const nv = riskAssessment.CalculatedCritALevel //ChosenSpreadMedanLifespanLevel
        // console.log("Autorun criterionA nv: " + JSON.stringify(nv))
        if (nv.amethod !== "AOOadjusted") { // only set criterion value (automatically) when certain amethods is used
            runInAction(() => {
                criterionA.value = nv.level
            })
        }
    });

    autorun(() => {
        const criterionB = getCriterion(riskAssessment, 0, "B")
          console.log("Autorun criterionB: " + criterionB.value)
        const nv = riskAssessment.ChosenSpreadYearlyIncreaseLevel
          console.log("Autorun criterionB nv: " + JSON.stringify(nv))
        runInAction(() => {
            criterionB.value = nv
        })
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
        //   console.log("Autorun criterionF .value: " + criterionF.value)
        const nv = riskAssessment.effectOnThreathenedNaturetypesLevel
        //   console.log("Autorun criterionF new value: " + nv)
        //   console.log("Autorun criterionF not equal: " + (nv != criterionF.value))
        runInAction(() => {
            criterionF.value = nv
        })
    });

    autorun(() => {
        const criterionG = getCriterion(riskAssessment, 1, "G")
        //   console.log("Autorun criterionG .value: " + criterionG.value)
        const nv = riskAssessment.effectOnOtherNaturetypesLevel
        //   console.log("Autorun criterionG new value: " + nv)
        //   console.log("Autorun criterionG not equal: " + (nv != criterionG.value))
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
        //try {
        const {level, decisiveCriteria, uncertaintyLevels} = riskAssessment.invasjonspotensialeLevel
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
            const result = RiskLevel.riskLevel(riskAssessment.invasjonspotensialeLevel, riskAssessment.ecoeffectLevel)
            return result;
        }
    });
    
    // autorun(() => {
    //     const {level, decisiveCriteriaLabel} = riskAssessment.riskLevel
    //     console.log("risklevel changed: " + level + " | " + decisiveCriteriaLabel)
    //     const levtxt = level.toString()

    //     riskAssessment.riskLevel = level
        
    //     riskAssessment.riskLevelCode = labels.RiskLevelCode[levtxt]
    //     riskAssessment.riskLevelText = labels.RiskLevelText[levtxt]
    //     riskAssessment.decisiveCriteria = decisiveCriteriaLabel
    // });
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
                        // Take care this does not happen! (uncomment the whyRun() function to trace the problem if necassary)

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
            // whyRun()
       })
    }
}


export default function enhanceCriteria(riskAssessment, vurdering, codes, labels, artificialAndConstructedSites) {
    enhanceRiskAssessmentComputedVurderingValues(riskAssessment, vurdering, artificialAndConstructedSites)
    enhanceRiskAssessmentLevel(riskAssessment, labels)
    enhanceCriteriaAddLabelsAndAuto(riskAssessment, codes)
    enhanceRiskAssessmentEcoEffect(riskAssessment)
    enhanceRiskAssessmentInvasjonspotensiale(riskAssessment)
    enhanceCriteriaAddUncertaintyRules(riskAssessment)
}

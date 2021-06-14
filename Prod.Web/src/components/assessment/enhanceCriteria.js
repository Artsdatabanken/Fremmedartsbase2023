import {action, autorun, extendObservable, observable, observe, isObservableArray, transaction, whyRun} from 'mobx';
import RiskLevel from './riskLevel';
import {extractFloat, getCriterion} from '../../utils'

// function getCriterion(riskAssessment, akse, letter) {
//     const result = riskAssessment.criteria.filter(c => c.Akse === akse && c.CriteriaLetter === letter)[0]; 
//     return result;
// }

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

function enhanceRiskAssessmentInvasjonspotensiale(riskAssessment) {
    const ACriteriaSectionNames = [
        "SpreadPVAAnalysisEstimatedSpeciesLongevity",
        "SpreadRscriptEstimatedSpeciesLongevity",
        "RedListCategoryLevel"
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
    ACriteriaSectionNames.concat(BCriteriaSectionNames).map(tag => {
        const obj = {}
        obj["Selectable" + tag] = () => selectableSection(tag)
        extendObservable(riskAssessment, obj)
    })


    extendObservable(riskAssessment, {
        // SpreadYearlyLiteratureDataExpansionSpeed: "", // todo: remove this when domain is updated
        // SpreadYearlyIncreaseCalculatedExpansionSpeed: "", // todo: remove this when domain is updated
        ChosenSpreadMedanLifespanLevel: () => {
            const num = extractFloat(riskAssessment[riskAssessment.ChosenSpreadMedanLifespan])
            const result = medianLifespanLevel(num)
            return result
        },
        ChosenSpreadYearlyIncreaseLevel: () => {
            const num = extractFloat(riskAssessment[riskAssessment.ChosenSpreadYearlyIncrease])
            const result = yearlyIncreaseLevel(num)
            return result
        }

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
        RedListCategoryLevel: () => {
            const catstr = riskAssessment.RedListCategory || ""
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
        //  console.log("Autorun criterionB: " + criterionB.Value)
        const nv = riskAssessment.ChosenSpreadMedanLifespanLevel
        //  console.log("Autorun criterionB nv: " + nv)
        criterionA.Value = nv
    });

    autorun(() => {
        const criterionB = getCriterion(riskAssessment, 0, "B")
        //  console.log("Autorun criterionB: " + criterionB.Value)
        const nv = riskAssessment.ChosenSpreadYearlyIncreaseLevel
        //  console.log("Autorun criterionB nv: " + nv)
        criterionB.Value = nv
    });

    autorun(() => {
        const criterionC = getCriterion(riskAssessment, 0, "C")
        //   console.log("Autorun criterionC .Value: " + criterionC.Value)
        const nv = riskAssessment.impactedNaturtypesColonizedAreaLevel
        //   console.log("Autorun criterionC new value: " + nv)
        //   console.log("Autorun criterionC not equal: " + (nv != criterionC.Value))
            criterionC.Value = nv
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
        riskAssessment.SpreadYearlyLiteratureData = val
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
        riskAssessment.SpreadYearlyIncreaseCalculatedExpansionSpeed = val
    });
}

function enhanceRiskAssessmentComputedVurderingValues(riskAssessment, vurdering, artificialAndConstructedSites) {

    // const artificialAndConstructedSites = ["F4", "F5", "H4", "L7", "L8", "M14", "M15", "T35", "T36", "T37", "T38", "T39", "T40", "T41", "T42", "T43", "T44", "T45", "V11", "V12", "V13"]

    extendObservable(riskAssessment, {
        vurderingCurrentExistenceAreaCalculated: () => vurdering.CurrentExistenceAreaCalculated,

        vurderingAllImpactedNatureTypes: () => vurdering.ImpactedNatureTypes.map(x => x),
        vurderingImpactedNaturalNatureTypes: () => vurdering.ImpactedNatureTypes.filter(
            nt => !artificialAndConstructedSites.filter(code => nt.NiNCode === code || nt.NiNCode.startsWith(code + "-") ).length > 0
        // ).filter(
        //     nt => !nt.NiNCode.startsWith("AM-") // Sverige
        ).filter(
            nt => !nt.NiNCode.startsWith("LI ")
        ),

        // C criteria
        impactedNaturtypesColonizedAreaLevel: () => {
                const levels =  riskAssessment.vurderingImpactedNaturalNatureTypes.map(nt => nt.ColonizedArea).map(area =>
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
        effectOnOtherNaturetypesLevel: () => {
            const levels = riskAssessment.vurderingImpactedNaturalNatureTypes.map(nt => nt.AffectedArea).map(area =>
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
        effectOnThreathenedNaturetypesLevel: () => {
            const levels = vurdering.RedlistedNatureTypes.map(
                nt => nt.AffectedArea
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
            //     console.log("ParasiteNewForHost type: " + typeof(item.ParasiteNewForHost))
            //     console.log("ParasiteNewForHost value: " + item.ParasiteNewForHost)
            // })
            const list4 = list.filter(item =>
                item.ParasiteIsAlien ||
                (rlThreatCats.indexOf(item.RedListCategory) > -1 && item.ParasiteNewForHost && !item.EffectLocalScale) ||
                (rlCats.indexOf(item.RedListCategory) > -1 && item.KeyStoneSpecie && item.ParasiteNewForHost && !item.EffectLocalScale)
            )
            const list3 = list.filter(item => 
                !item.ParasiteIsAlien &&
                (
                    (rlThreatCats.indexOf(item.RedListCategory) > -1 && item.ParasiteNewForHost && item.EffectLocalScale) ||
                    (rlCats.indexOf(item.RedListCategory) > -1 && item.KeyStoneSpecie && item.ParasiteNewForHost && item.EffectLocalScale) ||
                    (rlCats.indexOf(item.RedListCategory) > -1 && !item.KeyStoneSpecie && item.ParasiteNewForHost && !item.EffectLocalScale)
                )
            )
            const list2 = list.filter(item => 
                !item.ParasiteIsAlien &&
                (
                    (rlCats.indexOf(item.RedListCategory) > -1 && !item.KeyStoneSpecie && item.ParasiteNewForHost && item.EffectLocalScale) ||
                    (!item.ParasiteNewForHost && !item.EffectLocalScale)
                )
            )
            // console.log("list2 " + JSON.stringify(list2)   )
            // console.log("list3 " + JSON.stringify(list3)   )
            // console.log("list4 " + JSON.stringify(list4)   )


            const maxEffect4 = Math.max(...list4.map(item => parseInt(item.ParasiteEcoEffect)))
            const maxEffect3 = Math.max(...list3.map(item => parseInt(item.ParasiteEcoEffect)))
            const maxEffect2 = Math.max(...list2.map(item => parseInt(item.ParasiteEcoEffect)))

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
        DThreathenedSpeciesLevel: () => {
            const threatenedCats = ["VU","EN","CR"]
            const otherRlCats = ["LC","DD","NT"]
            const isThreatened = cat => threatenedCats.indexOf(cat) > -1
            const isOther = cat => otherRlCats.indexOf(cat) > -1
            
            const fullSpeciesList = riskAssessment.SpeciesSpeciesInteractions
            const speciesList = fullSpeciesList.filter(item => 
                isThreatened(item.RedListCategory) ||
                (isOther(item.RedListCategory) && item.KeyStoneSpecie))

            const speciesNaturtypeList = riskAssessment.SpeciesNaturetypeInteractions.filter(item => 
                item.KeyStoneSpecie)
            const list = [].concat(speciesNaturtypeList).concat(speciesList)
            // console.log("runD nat:" + speciesNaturtypeList.length)
            // console.log("runD spec:" + speciesList.length)
            // console.log("runD:" + list.length)
            const result = list.filter(item => 
                    (item.Effect === "Displacement") || 
                    (item.Effect === "Moderate" && !item.EffectLocalScale)).length > 0 ? 
                4 :
                list.filter(item => 
                    (item.Effect === "Moderate" && item.EffectLocalScale) || 
                    (item.Effect === "Weak" && !item.EffectLocalScale) ).length > 0 ? 
                3 :
                list.filter(item => 
                    (item.Effect === "Weak" && item.EffectLocalScale) ).length > 0 ? 
                2 :
                1
            return result - 1;
        }
    });
    extendObservable(riskAssessment, {
        EDomesticSpeciesLevel: () => {
            const otherRlCats = ["LC","DD","NT"]
            const fullSpeciesList = riskAssessment.SpeciesSpeciesInteractions
            const speciesList = fullSpeciesList.filter(item => otherRlCats.indexOf(item.RedListCategory) > -1 && !item.KeyStoneSpecie)
            // const speciesNaturtypeList = riskAssessment.SpeciesNaturetypeInteractions.map(x => x) // yeah - You need the map...
            // const speciesNaturtypeList = riskAssessment.SpeciesNaturetypeInteractions.filter(item => !item.KeyStoneSpecie)
            const speciesNaturtypeList = riskAssessment.SpeciesNaturetypeInteractions.map(a => a) // changed 23.02.2017 - let all nature types count for E-criteria (email from Heidi Solstad)
            const list = [].concat(speciesNaturtypeList).concat(speciesList)
            // console.log("runE nat:" + speciesNaturtypeList.length)
            // console.log("runE spec:" + speciesList.length)
            // console.log("runE:" + list.length)

            // console.log("runE:" + list.length)
            const result = list.filter(item => 
                    item.Effect === "Displacement" && !item.EffectLocalScale).length > 0 ?

                    // (item.Effect === "Displacement") ||
                    // // (item.Effect === "Displacement" && item.KeyStoneSpecie) ||
                    // (item.Effect === "Displacement" && !item.KeyStoneSpecie && !item.EffectLocalScale) ||
                    // (item.Effect === "Moderate" && item.KeyStoneSpecie && !item.EffectLocalScale)).length > 0 ? 
                4 :
                list.filter(item =>
                    item.Effect === "Displacement" && item.EffectLocalScale).length > 0 ?
                    // (item.Effect === "Displacement" && !item.KeyStoneSpecie && item.EffectLocalScale) ||
                    // (item.Effect === "Moderate" && item.KeyStoneSpecie && item.EffectLocalScale) ||
                    // (item.Effect === "Weak" && item.KeyStoneSpecie && !item.EffectLocalScale)).length > 0 ? 
                3 :
                list.filter(item => 
                    item.Effect === "Moderate" && !item.EffectLocalScale).length > 0 ?
                    // (item.Effect === "Moderate" && !item.KeyStoneSpecie && !item.EffectLocalScale) ||
                    // (item.Effect === "Weak" && item.KeyStoneSpecie && item.EffectLocalScale)).length > 0 ? 
                2 :
                1
            return result - 1;
        }
    });

    autorun(() => {
        const criterionF = getCriterion(riskAssessment, 1, "F")
        //   console.log("Autorun criterionF .Value: " + criterionF.Value)
        const nv = riskAssessment.effectOnThreathenedNaturetypesLevel
        //   console.log("Autorun criterionF new value: " + nv)
        //   console.log("Autorun criterionF not equal: " + (nv != criterionF.Value))
        criterionF.Value = nv
    });

    autorun(() => {
        const criterionG = getCriterion(riskAssessment, 1, "G")
        //   console.log("Autorun criterionG .Value: " + criterionG.Value)
        const nv = riskAssessment.effectOnOtherNaturetypesLevel
        //   console.log("Autorun criterionG new value: " + nv)
        //   console.log("Autorun criterionG not equal: " + (nv != criterionG.Value))
        criterionG.Value = nv
    });





    extendObservable(riskAssessment, {
        HGeneticTransferLevel: () => {
            const rlCats = ["LC","DD","NT"]
            const rlThreatCats = ["VU","EN","CR"]
            const list = riskAssessment.GeneticTransferDocumented
            const result = list.filter(item => 
                    !item.EffectLocalScale && 
                        (item.KeyStoneSpecie ||
                        (rlThreatCats.indexOf(item.RedListCategory) > -1))).length > 0 ? 
                4 :
                list.filter(item =>
                    (!item.EffectLocalScale && !item.KeyStoneSpecie && (rlCats.indexOf(item.RedListCategory) > -1)) ||
                    (item.EffectLocalScale && (rlThreatCats.indexOf(item.RedListCategory) > -1)) ||
                    (item.EffectLocalScale && item.KeyStoneSpecie && (rlCats.indexOf(item.RedListCategory) > -1))).length > 0 ? 
                3 :
                list.filter(item => 
                    (item.EffectLocalScale && !item.KeyStoneSpecie && (rlCats.indexOf(item.RedListCategory) > -1))).length > 0 ? 
                2 :
                1
            return result - 1;
        }
    });
    extendObservable(riskAssessment, {
        IHostParasiteLevel: () => {
            return critILevel(riskAssessment.HostParasiteInformations)
        }
    });
    autorun(() => {
        const criterionD = getCriterion(riskAssessment, 1, "D")
        // console.log("Autorun criterionD: " + criterionD.Value)
        const nv = riskAssessment.DThreathenedSpeciesLevel
        // console.log("Autorun criterionD nv: " + nv)
        criterionD.Value = nv
    });
    autorun(() => {
        const criterionE = getCriterion(riskAssessment, 1, "E")
        const nv = riskAssessment.EDomesticSpeciesLevel
        criterionE.Value = nv
    });
    autorun(() => {
        const criterionH = getCriterion(riskAssessment, 1, "H")
        criterionH.Value = riskAssessment.HGeneticTransferLevel
    });
    autorun(() => {
        const criterionI = getCriterion(riskAssessment, 1, "I")
        // console.log("Autorun criterionI: " + criterionI.Value)
        const nv = riskAssessment.IHostParasiteLevel
        // console.log("Autorun criterionI nv: " + nv)
        criterionI.Value = nv
    });
}

function enhanceRiskAssessmentLevel(riskAssessment, labels) {
    extendObservable(riskAssessment, {
        _invasjonspotensialeLevel: RiskLevel.invasjonspotensiale(riskAssessment)
    });
    autorun(() => {
        //try {
        const {level, decisiveCriteria, uncertaintyLevels} = riskAssessment._invasjonspotensialeLevel
        console.log("_invasjonspotensialeLevel changed: " + level)
        riskAssessment.invationPotentialLevel = level
        riskAssessment.invationPotentialUncertaintyLevels = uncertaintyLevels
        //}
        //catch (e) {}
    });
    extendObservable(riskAssessment, {
        _ecoeffectLevel: RiskLevel.ecoeffect(riskAssessment)
    });
    autorun(() => {
        //try {
        const {level, decisiveCriteria, uncertaintyLevels} = riskAssessment._ecoeffectLevel
        console.log("ecoeffectlevel changed: " + level)
        riskAssessment.ecoEffectLevel = level
        riskAssessment.ecoEffectUncertaintyLevels = uncertaintyLevels
        //}
        //catch (e) {}
    });

    delete riskAssessment.riskLevel  //todo: Check if necessary (or the correct way to do this) ?????  Basically: risklevel is observable from db data, but we want it to be a computed observable!
    extendObservable(riskAssessment, {
        riskLevel: () => {
            const result = RiskLevel.riskLevel(riskAssessment._invasjonspotensialeLevel, riskAssessment._ecoeffectLevel)
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

        // console.log("Crit>: " + letter)
        for (const levdef of cr.Children["Crit" + letter]) {
            const lev = {
                Value: Number(levdef.Value),
                Text: levdef.Text
            }
            // console.log("-" + JSON.stringify( lev))
            levs.push(lev)
        }
        crit.heading = cr.Text
        crit.info = cr.Info
        crit.codes = levs
        crit.auto = true
        
        Object.assign(getCriterion(riskAssessment, axis[letter], letter), crit)
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
            majorUncertainty: () => crit.UncertaintyValues.length >= 3
        })
        autorun(() => {
            const maxDistanecFromValue = 1
            const value = crit.Value
            let ud
            let uv
            if (crit.CriteriaLetter === "A" && 
                    riskAssessment.ChosenSpreadMedanLifespan === 'SpreadPVAAnalysisEstimatedSpeciesLongevity' 
            ) {
                const ulevels = uncertaintylevelsFor(riskAssessment.ChosenSpreadMedanLifespan, medianLifespanLevel)
                uv = ulevels
                ud = [0,1,2,3]
            } else if (crit.CriteriaLetter === "B" && 
                    (riskAssessment.ChosenSpreadYearlyIncrease === 'SpreadYearlyIncreaseOccurrenceArea' || 
                    riskAssessment.ChosenSpreadYearlyIncrease === 'SpreadYearlyIncreaseObservations')
            ) {
                const ulevels = uncertaintylevelsFor(riskAssessment.ChosenSpreadYearlyIncrease, yearlyIncreaseLevel)
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
            transaction(() => {
                    if (!firstrun) {
                        // The first run is done during page load
                        // We want to keep the saved uncertainty values!
                        // Successive calls should automatically set uncertainty when value changes
                        // NB! Careless changes to the application may cause this code to run multiple times during page load 
                        // Take care this does not happen! (uncomment the whyRun() function to trace the problem if necassary)

                        // console.log("nextrun: " + crit.CriteriaLetter + " : " + crit.Value)
                        
                        crit.uncertaintyValues.replace(uv)
                    } else {
                        // added 27.2.2017
                        // In the hope that this does not mess tings up
                        // this code is introduced to update illegal uncertainty values that
                        // are introduced when criteria rules are changed
                        // This functionality is also dependent on a well working "firstrun"; se comment above
                        // e.g. the criteria must not have a default value that is updated from db after the first run!

                        // console.log("firstrun: " + crit.CriteriaLetter + " : " + crit.Value + " - " + JSON.stringify(crit.uncertaintyValues))
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

import enhanceCriteria from './enhanceCriteria'
import fixFylker from './fixFylker'
import { action, autorun, extendObservable, observable, reaction, toJS} from 'mobx'
import errorhandler from '../errorhandler';
import getErrorDefinitions from './errorDefinitions';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils'
import { string } from 'prop-types'
import { nothing } from 'ol/pixel'

function deleteProps(obj, proparray) {
    for(const prop of proparray) {
        delete obj[prop]
    }
}
function copyProps(fromobj, toobj, proparray) {
    for(const prop of proparray) {
        toobj[prop] = fromobj[prop]
    }
}

//////////////////////////////////////////////////////////////
// these arrays contains all propertynames of 
// computed (mobx) values that replaces 
// the domain properties on the assessment. 
// 
// these properties needs to be deleted from the object
// before the computed (mobx) getters are added to the object
//
// since javascript serialization (toJSON) does not
// serialize getter properties, we need to add these
// properties to the JSON manually
///////////////////////////////////////////////////////////////
const assessmentGetterFields = [
    "category",
    "criteria",
    "alienSpeciesCategory",
    "assessmentConclusion",
    "spreadIndoorFurtherInfoGeneratedText",
    "spreadIntroductionFurtherInfoGeneratedText",
    "spreadFurtherSpreadFurtherInfoGeneratedText"
]
const riskAssessmentGetterFields = [
    "riskLevel",
    "riskLevelText",
    "riskLevelCode",
    "invationPotentialLevel",
    "ecoEffectLevel",
    "decisiveCriteria",
    "AOOchangeBest",
    "AOOchangeLow",
    "AOOchangeHigh",
    "adefaultBest",
    "adefaultLow",
    "adefaultHigh",
    "apossibleLow",
    "apossibleHigh",
    "ascore",
    "alow",
    "ahigh", 
    "medianLifetime",
    "lifetimeLowerQ",
    "lifetimeUpperQ",
    "bscore",
    "blow",
    "bhigh",
    "expansionSpeed",
    "expansionLowerQ",
    "expansionUpperQ",
    "AOOknown",
    "AOOtotalBest",
    "AOOtotalLow",
    "AOOtotalHigh",
    "AOO50yrBest",
    "AOO50yrLow",
    "AOO50yrHigh",
    "AOOdarkfigureBest",
    "AOOdarkfigureLow",
    "AOOdarkfigureHigh",
    "AOO10yrBest",
    "AOO10yrLow",
    "AOO10yrHigh",
    "introductionsLow",
    "introductionsHigh"
]


function nullToNaN(obj, proparray) {
    for(const prop of proparray) {
        if(obj[prop] === null) {
            obj[prop] = NaN
        }
    }
}

////////////////////////////////////////////////
// observableNumber uses NaN for no value
// but NaN is converted to null on server side
// when persisting data.
// to give more predictable behavior convert
// these properties from null -> NaN
// when initializing (enhance) the assessment 
////////////////////////////////////////////////
const riskAssessmentNumberFields = [
    "occurrences1Low",
    "occurrences1Best",
    "occurrences1High",
    // "introductionsLow",
    "introductionsBest",
    // "introductionsHigh",
    "AOOtotalLowInput",
    "AOOtotalBestInput",
    "AOOtotalHighInput",
    "AOO50yrLowInput",
    "AOO50yrBestInput",
    "AOO50yrHighInput",
]

////////////////////////////////////////////////
// Some fields are helperfields added to the
// assessment for convenience, but does not have 
// fields in the domain model.
// It is best to remove this fields before
// saving the document to reduce confusion...
////////////////////////////////////////////////
const assessmentHelperFields = [
    "statusChange",
]
const riskAssessmentHelperFields = [
    "critA", 
    "critB", 
    "critC", 
    "critD", 
    "critE", 
    "critF", 
    "critG", 
    "critH", 
    "critI",
    "chosenSpreadMedanLifespan_Was_RedListCategoryLevel",
    //"furtherInfoAboutImport" // no longer in use
]


function getCategoryText(val, pathways) {
    var text = ""
    if (pathways != undefined) {
        pathways.map (pathway => pathway.children.map(higherLevel => { 
            higherLevel.children.map(lowerLevel => {
                if (lowerLevel.value === val) { 
                    text = higherLevel.name + " - " + lowerLevel.name + ": "
                }
            })     
        }))
    }
    return text
}
function removeBreaks (text) {
    var br = new RegExp('<br>', 'ig');
    text = text.replace(br, '');
    return text
}
function generateFurtherInfoText(migrationPathways, appState) {
    var elaborateInformation = ""
    if (migrationPathways != []) {
        for (var i = 0; i < migrationPathways.length; i++) {
            if (migrationPathways[i].elaborateInformation != "") {
                var categoryText = getCategoryText(migrationPathways[i].codeItem, appState.spredningsveier.children)
                elaborateInformation += categoryText + removeBreaks(migrationPathways[i].elaborateInformation) + "." //+ "<br>"                       
            }
        }
    }
    return elaborateInformation
}

export default function enhanceAssessment(json, appState) {
    // * * * remove properties that will be replaced with computed observables * * *
    const jsonra = json.riskAssessment
    nullToNaN(json, riskAssessmentNumberFields)
    deleteProps(json, assessmentGetterFields)
    deleteProps(jsonra, riskAssessmentGetterFields)
    // * * *
    // ***** Fix invalid values ***********************
    if(jsonra.AOOfirstOccurenceLessThan10Years === null) {
        jsonra.AOOfirstOccurenceLessThan10Years = "yes"
    }
    if(jsonra.chosenSpreadYearlyIncrease === "c") {
        jsonra.chosenSpreadYearlyIncrease = "a"
    }
    // *****

    const assessment = observable.object(json)
    const labels = appState.codeLabels
    const codes = appState.koder
    const riskAssessment = assessment.riskAssessment
    const artificialAndConstructedSites = appState.artificialAndConstructedSites
    // enhanceCriteria(riskAssessment, assessment, codes, labels, artificialAndConstructedSites)
    // fixFylker(assessment);

    extendObservable(assessment, {
        get isAlienSpeciesString() {
            return assessment.isAlienSpecies ? "true" : "false"
        },
        set isAlienSpeciesString(s) {
            assessment.isAlienSpecies = s === "true"
        },
        get alienSpecieUncertainIfEstablishedBefore1800String() {
            return assessment.alienSpecieUncertainIfEstablishedBefore1800 ? "yes" : "no"
        },
        set alienSpecieUncertainIfEstablishedBefore1800String(s) {
            assessment.alienSpecieUncertainIfEstablishedBefore1800 = s === "yes"
        },
        get assumedReproducing50YearsString() {
            return assessment.assumedReproducing50Years ? "yes" : "no"
        },
        set assumedReproducing50YearsString(s) {
            assessment.assumedReproducing50Years = s === "yes"
        },
        get connectedToAnotherString() {
            return assessment.connectedToAnother ? "yes" : "no"
        },
        set connectedToAnotherString(s) {
            assessment.connectedToAnother = s === "yes"
        },

        get higherOrLowerLevelString() {
            return assessment.higherOrLowerLevel ? "yes" : "no"
        },
        set higherOrLowerLevelString(s) {
            assessment.higherOrLowerLevel = s === "yes"
        },
        get productionSpeciesString() {
            return assessment.productionSpecies == null ? null : (assessment.productionSpecies ? "yes" : "no")
        },
        set productionSpeciesString(s) {
            assessment.productionSpecies = s === "yes"
        },

        get spreadIndoorFurtherInfoGeneratedText() {
            const migrationPathways  = assessment.importPathways
            const result = generateFurtherInfoText(migrationPathways, appState)
            return result
        },
        get spreadIntroductionFurtherInfoGeneratedText() {
            const migrationPathways  = assessment.assesmentVectors.filter(vector => vector.introductionSpread == "introduction")
            const result = generateFurtherInfoText(migrationPathways, appState)
            return result
        },
        get spreadFurtherSpreadFurtherInfoGeneratedText() {
            const migrationPathways  = assessment.assesmentVectors.filter(vector => vector.introductionSpread == "spread")
            const result = generateFurtherInfoText(migrationPathways, appState)
            return result
        },

    })
    enhanceCriteria(riskAssessment, assessment, codes, labels, artificialAndConstructedSites)
    fixFylker(assessment);


    extendObservable(assessment, {
        get category() {
            const result =
                assessment.assessmentConclusion === "WillNotBeRiskAssessed"
                ? "NR"
                : assessment.riskAssessment.riskLevelCode
            return result
        },
        get criteria() {
            const result =
                assessment.assessmentConclusion === "WillNotBeRiskAssessed"
                ? ""
                : assessment.riskAssessment.decisiveCriteria
            return result
        },

        get assessmentConclusion() {
            const result = 
                !assessment.isAlienSpecies 
                ? "WillNotBeRiskAssessed"
                : assessment.higherOrLowerLevel 
                ? "WillNotBeRiskAssessed"
                : assessment.alienSpeciesCategory == "UncertainBefore1800"
                ? "WillNotBeRiskAssessed"
                : assessment.alienSpeciesCategory == "NotDefined"
                ? "NotDecided"           // todo: This should probably also be "WillNotBeRiskAssessed" (?? check this)
                : assessment.alienSpeciesCategory == "DoorKnocker"
                ? "AssessedDoorknocker" 
                : assessment.alienSpeciesCategory == "AlienSpecie"
                ? "AssessedSelfReproducing"
                : assessment.alienSpeciesCategory == "RegionallyAlien"
                ? "AssessedSelfReproducing"
                : assessment.alienSpeciesCategory == "EffectWithoutReproduction"
                ? "AssessedDoorknocker"

                : "WillNotBeRiskAssessed"
            return result
        },
        get doFullAssessment() {
            return assessment.assessmentConclusion !== "NotDecided" && assessment.assessmentConclusion !== "WillNotBeRiskAssessed" 
        },
        get alienSpeciesCategory() {
            const result = 
                ! assessment.isAlienSpecies
                ? "NotAlienSpecie"
                : assessment.higherOrLowerLevel
                ? "TaxonEvaluatedAtAnotherLevel" 
                : assessment.alienSpecieUncertainIfEstablishedBefore1800
                ? "UncertainBefore1800"
                : !assessment.speciesStatus
                ? "NotDefined"
                : (assessment.assumedReproducing50Years !== null && !assessment.assumedReproducing50Years)
                    && (assessment.speciesStatus.startsWith("B1") || assessment.speciesStatus.startsWith("B2") || assessment.speciesStatus.startsWith("C0") || assessment.speciesStatus.startsWith("C1"))
                ? "EffectWithoutReproduction"
                : assessment.isRegionallyAlien
                ? "RegionallyAlien"
                : assessment.speciesStatus.startsWith("C2") || assessment.speciesStatus.startsWith("C3")
                ? "AlienSpecie"
                : "DoorKnocker"
            return result
        },
        get isDoorKnocker() {
            return assessment.alienSpeciesCategory === "DoorKnocker" || assessment.alienSpeciesCategory === "EffectWithoutReproduction"
        },

        get categoryHasChangedFromPreviousAssessment() {
            const result =
                (
                    (assessment.assessmentConclusion != "NotDecided" 
                        && assessment.assessmentConclusion != "WillNotBeRiskAssessed" 
                        && assessment.riskAssessment.riskLevelCode != null 
                        && assessment.previousAssessments[0] != null 
                        && (assessment.previousAssessments[0].riskLevel !== assessment.riskAssessment.riskLevel
                            || assessment.previousAssessments[0].mainCategory == "NotApplicable")
                    ) 
                    || (
                        assessment.assessmentConclusion == "WillNotBeRiskAssessed" 
                        && assessment.riskAssessment.riskLevelCode != null 
                        && assessment.previousAssessments[0] != null
                        && assessment.previousAssessments[0].mainCategory != "NotApplicable" 
                    )
                )

            return result
        },






    
        get horizonDoAssessment() {
            const result =
                !this.horizonEstablismentPotential || !this.horizonEcologicalEffect 
                ? false 
                : this.horizonEstablismentPotential == "2" 
                  || (this.horizonEstablismentPotential == "1" && this.horizonEcologicalEffect != "no") 
                  || (this.horizonEstablismentPotential == "0" && this.horizonEcologicalEffect == "yesAfterGone")
            return result
        },
    
    
        get horizonScanned() {
            return (this.horizonEstablismentPotential == 2
                || (this.horizonEstablismentPotential == 1 && this.horizonEcologicalEffect != "no")
                || (this.horizonEstablismentPotential == 0 && this.horizonEcologicalEffect == "yesAfterGone"))
        },
    
        get doDoorKnockerAssessment() { // skalVurderes() {
            // todo. denne er nå knyttet til horisontskanning. Burde kanskje vært generell og hentet verdi fra: assessment.assessmentConclusion
            return this.isDoorKnocker && this.skalVurderes ? true : false
        },





        statusChange: false,

    })
    extendObservable(assessment, {
        get toJSON() {
            const assra = assessment.riskAssessment
            const obj = toJS(assessment)
            const objra = obj.riskAssessment
            deleteProps(obj, assessmentHelperFields)
            deleteProps(objra, riskAssessmentHelperFields)
            copyProps(assessment, obj, assessmentGetterFields)
            copyProps(assra, objra, assessmentGetterFields)
        
            const json = JSON.stringify(obj, undefined, 2)
            // console.log(JSON.stringify(Object.keys(obj)))
            return json
        }
    });

    autorun(() => {
        const asc = assessment.alienSpeciesCategory
        console.log("¤¤¤ alienSpeciesCategory: " + asc)
    
    })
    autorun(() => {
        const ss = assessment.speciesStatus
        console.log("¤¤¤ speciesStatus: '" + ss + "'")
    
    })

    autorun(() => {
        const ss = assessment.categoryHasChangedFromPreviousAssessment
        console.log("¤!¤ categoryHasChangedFromPreviousAssessment: '" + ss + "'")
    
    })

    reaction(
        () => assessment.alienSpeciesCategory,
        (alienSpeciesCategory, previousAlienSpeciesCategory) => {
            const change =
            (alienSpeciesCategory === "AlienSpecie" && (previousAlienSpeciesCategory === "DoorKnocker" || previousAlienSpeciesCategory === "EffectWithoutReproduction" )) ||
            ((alienSpeciesCategory === "DoorKnocker" || alienSpeciesCategory === "EffectWithoutReproduction") && previousAlienSpeciesCategory === "AlienSpecie") 
            // console.log("##¤statuschange: " + change + " " + alienSpeciesCategory + " " + previousAlienSpeciesCategory)
            if (assessment.speciesStatus != null) {
                action(() => {
                    // console.log("##¤statuschange 2: " + change)
                    assessment.statusChange = change
                })()
            }
        }
    )


    const errorHelpers = {
        resolveid: errorhandler.resolveid,
        isTrueteogsjeldnenaturtype: appState.isTrueteogsjeldnenaturtype
    }

    // const errorDefinitions = getErrorDefinitions(assessment, errorhandler.resolveid)
    const errorDefinitions = getErrorDefinitions(assessment, errorHelpers)

    errorhandler.addErrors(errorDefinitions)

    return assessment
}

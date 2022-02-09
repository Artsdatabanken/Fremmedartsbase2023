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
    "assessmentConclusion"
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



export default function enhanceAssessment(json, appState) {
    // * * * remove properties that will be replaced with computed observables * * *
    const ra = json.riskAssessment
    deleteProps(json, assessmentGetterFields)
    deleteProps(ra, riskAssessmentGetterFields)
    
    // * * *
    const assessment = observable.object(json)
    const labels = appState.codeLabels
    const codes = appState.koder
    const riskAssessment = assessment.riskAssessment
    const artificialAndConstructedSites = appState.artificialAndConstructedSites
    // enhanceCriteria(riskAssessment, assessment, codes, labels, artificialAndConstructedSites)
    // fixFylker(assessment);

    extendObservable(assessment, {
        get isAlienSpeciesString() {
            return assessment.isAlienSpecies || assessment.horizonEstablismentPotential == 2 ? "true" : "false"
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

        get alienSpeciesCategory() {
            const result = 
                ! assessment.isAlienSpecies
                ? "NotAlienSpecie"
                : assessment.alienSpecieUncertainIfEstablishedBefore1800
                ? "UncertainBefore1800"
                // : !assessment.horizonDoAssessment
                // ? "NotDefined1"
                : !assessment.speciesStatus
                ? "NotDefined"
                : assessment.hasEffectWithoutReproduction // todo: property not implemented
                ? "EffectWithoutReproduction"
                : assessment.isRegionallyAlien
                ? "RegionallyAlien"
                : assessment.speciesStatus.startsWith("C2") || assessment.speciesStatus.startsWith("C3")
                ? "AlienSpecie"
                : "DoorKnocker"
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
                ? "WillNotBeRiskAssessed"

                : "WillNotBeRiskAssessed"
            return result
        },
        get doFullAssessment() {
            return assessment.assessmentConclusion !== "WillNotBeRiskAssessed" 
        },
        // get category() {
        //     const result =
        //         assessment.assessmentConclusion === "WillNotBeRiskAssessed"
        //         ? "NR"
        //         : assessment.riskAssessment.riskLevelCode
        //     return result
        // },
        // get criteria() {
        //     const result =
        //         assessment.assessmentConclusion === "WillNotBeRiskAssessed"
        //         ? ""
        //         : assessment.riskAssessment.decisiveCriteria
        //     return result
        // },

    })
    //deleteProps(ra, riskAssessmentGetterFields)
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
    })
    extendObservable(assessment, {
        get toJSON() {
            const assra = assessment.riskAssessment
            const obj = toJS(assessment)
            const objra = obj.riskAssessment
            copyProps(assessment, obj, assessmentGetterFields)
            copyProps(assra, objra, assessmentGetterFields)
        
            const json = JSON.stringify(obj, undefined, 2)
            // console.log(JSON.stringify(Object.keys(obj)))
            return json
        }
    });



    reaction(
        () => assessment.alienSpeciesCategory,
        (alienSpeciesCategory, previousAlienSpeciesCategory) => {
            const change =
            (alienSpeciesCategory == "AlienSpecie" && previousAlienSpeciesCategory == "DoorKnocker") ||
            (alienSpeciesCategory == "DoorKnocker" && previousAlienSpeciesCategory == "AlienSpecie") 
            // console.log("##¤statuschange: " + change + " " + alienSpeciesCategory + " " + previousAlienSpeciesCategory)
            action(() => {
                console.log("##¤statuschange 2: " + change)
                appState.statusChange = change
            })()
        }
    )

    const errorDefinitions = getErrorDefinitions(assessment)

    errorhandler.addErrors(errorDefinitions)
    return assessment
}

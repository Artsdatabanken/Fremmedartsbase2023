import enhanceCriteria from './enhanceCriteria'
import fixFylker from './fixFylker'
import { action, autorun, extendObservable, observable, reaction, toJS} from 'mobx'
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils'
import { string } from 'prop-types'
import { nothing } from 'ol/pixel'








export default function enhanceAssessment(json, appState) {
    // * * * remove properties that will be replaced with computed observables * * *
    const ra = json.riskAssessment
    delete json.category
    delete json.criteria
    delete json.alienSpeciesCategory
    delete json.assessmentConclusion
    delete ra.riskLevel
    delete ra.riskLevelText
    delete ra.riskLevelCode
    delete ra.invationPotentialLevel
    delete ra.ecoEffectLevel
    delete ra.decisiveCriteria
    delete ra.AOOchangeBest
    delete ra.AOOchangeLow
    delete ra.AOOchangeHigh
    delete ra.adefaultBest
    delete ra.adefaultLow
    delete ra.adefaultHigh
    delete ra.apossibleLow
    delete ra.apossibleHigh
    delete ra.ascore
    delete ra.alow 
    delete ra.ahigh 
    delete ra.medianLifetime 
    delete ra.lifetimeLowerQ 
    delete ra.lifetimeUpperQ 
    delete ra.bscore 
    delete ra.blow 
    delete ra.bhigh 
    delete ra.expansionSpeed 
    delete ra.expansionLowerQ 
    delete ra.expansionUpperQ 
    delete ra.AOOdarkfigureBest
    delete ra.AOOdarkfigureLow
    delete ra.AOOdarkfigureHigh
    delete ra.AOO10yrBest
    delete ra.AOO10yrLow
    delete ra.AOO10yrHigh
    delete ra.introductionsLow
    delete ra.introductionsHigh
    
    

    
    // * * *
    const assessment = observable.object(json)
    const labels = appState.codeLabels
    const codes = appState.koder
    const riskAssessment = assessment.riskAssessment
    const artificialAndConstructedSites = appState.artificialAndConstructedSites
    enhanceCriteria(riskAssessment, assessment, codes, labels, artificialAndConstructedSites)
    fixFylker(assessment);

    extendObservable(assessment, {
        get toJSON() {
            const assra = assessment.riskAssessment
            const obj = toJS(assessment)
            const objra = obj.riskAssessment
            obj.category = assessment.category
            obj.criteria = assessment.criteria
            obj.alienSpeciesCategory = assessment.alienSpeciesCategory
            obj.assessmentConclusion = assessment.assessmentConclusion
            objra.riskLevel = assra.riskLevel
            objra.riskLevelText = assra.riskLevelText
            objra.riskLevelCode = assra.riskLevelCode
            objra.invationPotentialLevel = assra.invationPotentialLevel
            objra.ecoEffectLevel = assra.ecoEffectLevel
            objra.decisiveCriteria = assra.decisiveCriteria
            objra.AOOchangeBest = assra.AOOchangeBest
            objra.AOOchangeLow = assra.AOOchangeLow
            objra.AOOchangeHigh = assra.AOOchangeHigh
            objra.adefaultBest = assra.adefaultBest
            objra.adefaultLow = assra.adefaultLow
            objra.adefaultHigh = assra.adefaultHigh
            objra.apossibleLow = assra.apossibleLow
            objra.apossibleHigh = assra.apossibleHigh
            objra.ascore = assra.ascore
            objra.alow = assra.alow
            objra.ahigh = assra.ahigh
            objra.medianLifetime = assra.medianLifetime
            objra.lifetimeLowerQ = assra.lifetimeLowerQ
            objra.lifetimeUpperQ = assra.lifetimeUpperQ
            objra.bscore = assra.bscore
            objra.blow = assra.blow
            objra.bhigh = assra.bhigh
            objra.expansionSpeed = assra.expansionSpeed
            objra.expansionLowerQ = assra.expansionLowerQ
            objra.expansionUpperQ = assra.expansionUpperQ
            objra.AOOdarkfigureBest = assra.AOOdarkfigureBest
            objra.AOOdarkfigureLow = assra.AOOdarkfigureLow
            objra.AOOdarkfigureHigh = assra.AOOdarkfigureHigh
            objra.AOO10yrBest = assra.AOO10yrBest
            objra.AOO10yrLow = assra.AOO10yrLow
            objra.AOO10yrHigh = assra.AOO10yrHigh
            objra.introductionsLow = assra.introductionsLow
            objra.introductionsHigh = assra.introductionsHigh            
        
            const json = JSON.stringify(obj, undefined, 2)
            // console.log(JSON.stringify(Object.keys(obj)))
            return json
        }
    });

    extendObservable(assessment, {
        // this value is not a part of the domain object
        get isAlienSpeciesString() {
            // const alien = assessment.alienSpeciesCategory =="AlienSpecie" || assessment.notApplicableCategory == "establishedBefore1800"
            return assessment.isAlienSpecies ? "true" : "false"
        },
        set isAlienSpeciesString(s) {
            assessment.isAlienSpecies = s === "true"
        },
        // this value is not a part of the domain object
        get alienSpecieUncertainIfEstablishedBefore1800String() {
            // const value = assessment.notApplicableCategory == "establishedBefore1800" ? "yes" :  assessment.alienSpeciesCategory == "AlienSpecie" ? "no" : null
            return assessment.alienSpecieUncertainIfEstablishedBefore1800 ? "yes" : "no"
        },
        set alienSpecieUncertainIfEstablishedBefore1800String(s) {
            //assessment.assumedReproducing50Years = s === "yes"
            assessment.alienSpecieUncertainIfEstablishedBefore1800 = s === "yes"
        },
        get assumedReproducing50YearsString() {
            //return assessment.alienSpecieUncertainIfEstablishedBefore1800 ? "yes" : "no"
            return assessment.assumedReproducing50Years ? "yes" : "no"
        },
        set assumedReproducing50YearsString(s) {
            assessment.assumedReproducing50Years = s === "yes"
        },
        // this value is not a part of the domain object
        get connectedToAnotherString() {
            // const value assessment.alienSpeciesCategory == "AlienSpecie" ? "no" : assessment.connectedToAnother ? "true" : "false" 
            return assessment.connectedToAnother ? "yes" : "no"
        },
        set connectedToAnotherString(s) {
            assessment.connectedToAnother = s === "yes"
        },
        get productionSpeciesString() {
            // const value = assessment.notApplicableCategory == "establishedBefore1800" ? "yes" :  assessment.alienSpeciesCategory == "AlienSpecie" ? "no" : null
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
                ? "NotAlienSpecie"
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

                // "EcoEffectWithoutEstablishment"

            return result
        },
        get assessmentConclusion() {
            const result = 
                assessment.connectedToAnother
                ? "WillNotBeRiskAssessed"
                : assessment.alienSpeciesCategory == "AlienSpecie"
                ? "AssessedSelfReproducing"
                : assessment.alienSpeciesCategory == "RegionallyAlien"
                ? "AssessedSelfReproducing" // todo: check this
                : assessment.alienSpeciesCategory == "DoorKnocker"
                ? "AssessedDoorknocker"
                : "WillNotBeRiskAssessed"
            return result
        },
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
    return assessment
}

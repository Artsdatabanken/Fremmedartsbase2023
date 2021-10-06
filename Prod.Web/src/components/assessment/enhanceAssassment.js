import enhanceCriteria from './enhanceCriteria'
import { extendObservable, observable, toJS} from 'mobx'








export default function enhanceAssessment(json, appState) {
    // * * * remove properties that will be replaced with computed observables * * *
    const ra = json.riskAssessment
    delete ra.riskLevel
    delete ra.riskLevelText
    delete ra.riskLevelCode
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
    delete ra.AOO10yrBest
    delete ra.AOO10yrLow
    delete ra.AOO10yrHigh
    delete ra.introductionsLow
    delete ra.introductionsHigh
    
    

    
    // * * *
    const assessment = observable.object(json)

    const labels = appState.codeLabels
    const codes = appState.koder

    // const riskAssessment = fabModel.activeRegionalRiskAssessment;
    const riskAssessment = assessment.riskAssessment

    const artificialAndConstructedSites = appState.artificialAndConstructedSites

    // todo: Remove this section before launch! 
    // Code/statechange to help with developement/debugging is placed here
    console.log("RUN ENHANCEMENTS HERE")
    riskAssessment.chosenSpreadMedanLifespan = "ViableAnalysis"
    //assessment.horizonDoScanning = true;  //todo: remove this (It is here for testing purposes)
    // ----------------------------------


    enhanceCriteria(riskAssessment, assessment, codes, labels, artificialAndConstructedSites)


    //if(assessment.horizonDoScanning !== false) {console.warn("horizonDoScanning should be false for now")}

    extendObservable(assessment, {
        get toJSON() {
            const assra = assessment.riskAssessment
            const obj = toJS(assessment)
            const objra = obj.riskAssessment
            objra.riskLevel = assra.riskLevel
            objra.riskLevelText = assra.riskLevelText
            objra.riskLevelCode = assra.riskLevelCode
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

    
    return assessment

}

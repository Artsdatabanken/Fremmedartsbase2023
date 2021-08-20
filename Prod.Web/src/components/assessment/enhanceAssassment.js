import enhanceCriteria from './enhanceCriteria'
import { observable} from 'mobx'








export default function enhanceAssessment(json, appState) {
    // * * * remove properties that will be replaced with computed observables * * *
    const ra = json.riskAssessment
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


    if(assessment.horizonDoScanning !== false) {console.warn("horizonDoScanning should be false for now")}

    
    
    return assessment

}

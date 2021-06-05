import enhanceCriteria from './enhanceCriteria'








export default function enhanceAssessment(assessment, appState) {
    const labels = appState.codeLabels
    const codes = appState.koder

    // const riskAssessment = fabModel.activeRegionalRiskAssessment;
    const riskAssessment = assessment.riskAssessment

    const artificialAndConstructedSites = appState.artificialAndConstructedSites

    console.log("RUN ENHANCEMENTS HERE")

    enhanceCriteria(riskAssessment, assessment, codes, labels, artificialAndConstructedSites)



}

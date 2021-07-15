const critdefs = [
    ["A",0,"InvasionPopulationLifetimeExpectancy"],
    ["B",0,"InvasionExpansionSpeed"],
    ["C",0,"InvasionColonizationOfNaturetypeAfter50Years"],
    ["D",1,"EcologicalEffectInteractionWithThreatenedSpecies"],
    ["E",1,"EcologicalEffectInteractionWithDomesticSpecies"],
    ["F",1,"EcologicalEffectInfluenceOnThreatenedNatureTypes"],
    ["G",1,"EcologicalEffectInfluenceOnCommonNatureTypes"],
    ["H",1,"EcologicalEffectTransferOfGeneticMaterial"],
    ["I",1,"EcologicalEffectTransferOfDiseasesAndParasites"]
]
const createCrit = (critdef) => ({
    criteriaLetter: critdef[0],
    akse: critdef[1],
    id: critdef[2],
    noValueInformation:null,
    uncertaintyValues:[0],
    value:0,
})
export const getCriterion = (riskAssessment, letter) => {
    const result = riskAssessment.criteria.find(c => c.criteriaLetter === letter); 
    return result;
};        

// const createCrits = () => critdefs.map(createCrit)reduce((acc, crit) => {acc[crit.criteriaLetter] = crit; return acc}, {})
const createCrits = () => critdefs.map(createCrit)
const createRiskAssessment = () => ({criteria: createCrits()})
describe('createRiskAssessment', () => {
  it('creates criterias', () => {
    const ra = createRiskAssessment()
    expect(getCriterion(ra, "E").id === "EcologicalEffectInteractionWithDomesticSpecies").toBeTruthy();
  });
})

export default createRiskAssessment
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
    CriteriaLetter: critdef[0],
    Akse: critdef[1],
    Id: critdef[2],
    NoValueInformation:null,
    UncertaintyValues:[0],
    Value:0,
})
export const getCriterion = (riskAssessment, letter) => {
    const result = riskAssessment.Criteria.find(c => c.CriteriaLetter === letter); 
    return result;
};        

// const createCrits = () => critdefs.map(createCrit)reduce((acc, crit) => {acc[crit.CriteriaLetter] = crit; return acc}, {})
const createCrits = () => critdefs.map(createCrit)
const createRiskAssessment = () => ({Criteria: createCrits()})
describe('createRiskAssessment', () => {
  it('creates criterias', () => {
    const ra = createRiskAssessment()
    expect(getCriterion(ra, "E").Id === "EcologicalEffectInteractionWithDomesticSpecies").toBeTruthy();
  });
})

export default createRiskAssessment
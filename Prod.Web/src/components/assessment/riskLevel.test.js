import riskLevel from './riskLevel'
import createRiskAssessment, {getCriterion} from './riskLevel.test-data'

// describe('riskLevel', () => {
//   test('C criterion influences invasjonspotensiale level', () => {
//     const ra = createRiskAssessment()
//     const cCrit = getCriterion(ra, "C")
//     cCrit.Value = 2
//     const inv = riskLevel.invasjonspotensiale(ra)
//     expect(inv.level).toEqual(2);
//   })
//   test('C criterion influences invasjonspotensiale uncertainty', () => {
//     const ra = createRiskAssessment()
//     const cCrit = getCriterion(ra, "C")
//     cCrit.Value = 2
//     cCrit.UncertaintyValues = [1,2,3]
//     const inv = riskLevel.invasjonspotensiale(ra)
//     expect(inv.uncertaintyLevels).toEqual([1,2,3]);
//   })
//   test('E criterion influences ecoeffect level', () => {
//     const ra = createRiskAssessment()
//     const cCrit = getCriterion(ra, "E")
//     cCrit.Value = 1
//     const eco = riskLevel.ecoeffect(ra)
//     expect(eco.level).toEqual(1);
//   })
//   test('E criterion influences ecoeffect uncertainty', () => {
//     const ra = createRiskAssessment()
//     const eCrit = getCriterion(ra, "E")
//     eCrit.Value = 1
//     eCrit.UncertaintyValues = [0,1,2]
//     const eco = riskLevel.ecoeffect(ra)
//     expect(eco.uncertaintyLevels).toEqual([0,1,2]);
//   })

//   test('highest criterion level wins', () => {
//     const ra = createRiskAssessment()
//     const dCrit = getCriterion(ra, "D")
//     const eCrit = getCriterion(ra, "E")
//     dCrit.Value = 2
//     eCrit.Value = 3
//     const eco = riskLevel.ecoeffect(ra)
//     expect(eco.level).toEqual(3);
//   })
//   test('highest criterion counts for uncertaintylevel', () => {
//     const ra = createRiskAssessment()
//     const dCrit = getCriterion(ra, "D")
//     const eCrit = getCriterion(ra, "E")
//     dCrit.Value = 1
//     dCrit.UncertaintyValues = [0,1,2]
//     eCrit.Value = 2
//     eCrit.UncertaintyValues = [2,3]
//     const eco = riskLevel.ecoeffect(ra)
//     expect(eco.uncertaintyLevels).toEqual([2,3]);
//   })

//   test('equal criterion level only sets sweeping uncertaintylevels', () => {
//     const ra = createRiskAssessment()
//     const dCrit = getCriterion(ra, "D")
//     const eCrit = getCriterion(ra, "E")
//     dCrit.Value = 2
//     dCrit.UncertaintyValues = [1,2,3]
//     eCrit.Value = 2
//     eCrit.UncertaintyValues = [2,3]
//     const eco = riskLevel.ecoeffect(ra)
//     expect(eco.uncertaintyLevels).toEqual([2,3]);
//   })

// });

// describe('A+B criteria', () => {
//   it('has mutal dependency', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 3
//     bCrit.Value = 1
//     const inv = riskLevel.invasjonspotensiale(ra)
//     expect(inv.level).toEqual(2);
//   })
//   it('has expected decisive criteria(1)', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 3
//     bCrit.Value = 1
//     const inv = riskLevel.invasjonspotensiale(ra)
//     expect(inv.decisiveCriteria.map(c => c.CriteriaLetter)).toEqual(["A"]);
//   })
//   it('has expected decisive criteria(2)', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 2
//     bCrit.Value = 2
//     const inv = riskLevel.invasjonspotensiale(ra)
//     expect(inv.level).toEqual(2);
//     expect(inv.decisiveCriteria.map(c => c.CriteriaLetter)).toEqual(["A", "B"]);
//   })
//   it('has expected decisive criteria(3)', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 1
//     bCrit.Value = 2
//     const inv = riskLevel.invasjonspotensiale(ra)
//     // console.log("dc length: " + inv.decisiveCriteria.length)
//     // console.log("dc: " + JSON.stringify(inv.decisiveCriteria))
//     expect(inv.level).toEqual(2);
//     expect(inv.decisiveCriteria.map(c => c.CriteriaLetter)).toEqual(["B"]);
//   })
//   it('has expected uncertaintylevels(1)', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 2
//     aCrit.UncertaintyValues = [1,2]
//     bCrit.Value = 2
//     bCrit.UncertaintyValues = [2,3]
//     const inv = riskLevel.invasjonspotensiale(ra)
//     // console.log("dc length: " + inv.decisiveCriteria.length)
//     // console.log("dc: " + JSON.stringify(inv.decisiveCriteria))
//     expect(inv.level).toEqual(2);
//     expect(inv.uncertaintyLevels).toEqual([2,3]);
//   })
//   it('has expected uncertaintylevels(2)', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 1
//     aCrit.UncertaintyValues = [0,1]
//     bCrit.Value = 2
//     bCrit.UncertaintyValues = [2,3]
//     const inv = riskLevel.invasjonspotensiale(ra)
//     // console.log("dc length: " + inv.decisiveCriteria.length)
//     // console.log("dc: " + JSON.stringify(inv.decisiveCriteria))
//     expect(inv.level).toEqual(2);
//     expect(inv.uncertaintyLevels).toEqual([1,2]);
//   })


//   it('when A2> B1> gives 1>', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 1
//     aCrit.UncertaintyValues = [1,2]
//     bCrit.Value = 0
//     bCrit.UncertaintyValues = [0,1]
//     const inv = riskLevel.invasjonspotensiale(ra)
//     expect(inv.level).toEqual(0);
//     expect(inv.uncertaintyLevels).toEqual([0,1]);
//   })


//   it('when A<2> B1 gives 1>', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 1
//     aCrit.UncertaintyValues = [0,1,2]
//     bCrit.Value = 0
//     bCrit.UncertaintyValues = [0]
//     const inv = riskLevel.invasjonspotensiale(ra)

//     // console.log("dc length: " + inv.decisiveCriteria.length)
//     // console.log("dc: " + JSON.stringify(inv.decisiveCriteria))
//     expect(inv.level).toEqual(0);
//     expect(inv.uncertaintyLevels).toEqual([0,1]);
//   })
//   it('when A4 B<2> gives <3>', () => {
//     const ra = createRiskAssessment()
//     const aCrit = getCriterion(ra, "A")
//     const bCrit = getCriterion(ra, "B")
//     aCrit.Value = 3
//     aCrit.UncertaintyValues = [3]
//     bCrit.Value = 1
//     bCrit.UncertaintyValues = [0,1,2]
//     const inv = riskLevel.invasjonspotensiale(ra)
//     // console.log("dc length: " + inv.decisiveCriteria.length)
//     // console.log("dc: " + JSON.stringify(inv.decisiveCriteria))
//     expect(inv.level).toEqual(2);
//     expect(inv.uncertaintyLevels).toEqual([1,2,3]);
//   })

//   it('when E<3> G3> gives 3>', () => {
//     const ra = createRiskAssessment()
//     const eCrit = getCriterion(ra, "E")
//     const gCrit = getCriterion(ra, "G")
//     eCrit.Value = 2
//     eCrit.UncertaintyValues = [1,2,3]
//     gCrit.Value = 2
//     gCrit.UncertaintyValues = [2,3]
//     const eco = riskLevel.ecoeffect(ra)
//     // console.log("dc length: " + inv.decisiveCriteria.length)
//     // console.log("dc: " + JSON.stringify(inv.decisiveCriteria))
//     expect(eco.level).toEqual(2);
//     expect(eco.uncertaintyLevels).toEqual([2,3]);
//   })
//   it('when E<3 G3> gives 3>', () => {
//     const ra = createRiskAssessment()
//     const eCrit = getCriterion(ra, "E")
//     const gCrit = getCriterion(ra, "G")
//     eCrit.Value = 2
//     eCrit.UncertaintyValues = [1,2]
//     gCrit.Value = 2
//     gCrit.UncertaintyValues = [2,3]
//     const eco = riskLevel.ecoeffect(ra)
//     // console.log("dc length: " + inv.decisiveCriteria.length)
//     // console.log("dc: " + JSON.stringify(inv.decisiveCriteria))
//     expect(eco.level).toEqual(2);
//     expect(eco.uncertaintyLevels).toEqual([2,3]);
//   })
// });

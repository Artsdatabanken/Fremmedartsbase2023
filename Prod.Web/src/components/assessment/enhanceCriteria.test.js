import { critILevel } from './enhanceCriteria'

describe('enhanceCriteria crit I Level', () => {
    it('has default level with no rows', () => {
        const lev = critILevel([])
        expect(lev).toEqual(0);
    })
    it('has expected level with parasiteIsAlien', () => {
        const lev4 = critILevel([{ parasiteIsAlien: true, parasiteEcoEffect: 4 }])
        expect(lev4).toEqual(3);
        const lev3 = critILevel([{ parasiteIsAlien: true, parasiteEcoEffect: 3 }])
        expect(lev3).toEqual(2);
        const lev2 = critILevel([{ parasiteIsAlien: true, parasiteEcoEffect: 2 }])
        expect(lev2).toEqual(1);
        const lev1 = critILevel([{ parasiteIsAlien: true, parasiteEcoEffect: 1 }])
        expect(lev1).toEqual(0);
    })
    it('has expected level for threathened species without locale scale', () => {
        const lev4 = critILevel([{ redListCategory: "CR", effectLocalScale: false, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 4 }])
        expect(lev4).toEqual(3);
        const lev2 = critILevel([{ redListCategory: "CR", effectLocalScale: false, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 2 }])
        expect(lev2).toEqual(1);
    })
    it('has expected level for threathened species with locale scale', () => {
        const lev3_4 = critILevel([{ redListCategory: "CR", effectLocalScale: true, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 4 }])
        expect(lev3_4).toEqual(2);
        const lev2 = critILevel([{ redListCategory: "CR", effectLocalScale: true, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 2 }])
        expect(lev2).toEqual(1);
    })
    it('has expected level for other keystone RL species with locale scale', () => {
        const lev3_4 = critILevel([{ redListCategory: "LC", keyStoneSpecie: true, effectLocalScale: true, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 4 }])
        expect(lev3_4).toEqual(2);
        const lev2 = critILevel([{ redListCategory: "LC", keyStoneSpecie: true, effectLocalScale: true, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 2 }])
        expect(lev2).toEqual(1);
        const lev1 = critILevel([{ redListCategory: "LC", keyStoneSpecie: true, effectLocalScale: true, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 1 }])
        expect(lev1).toEqual(0);
    })
    it('has expected level for other RL species without locale scale', () => {
        const lev3_4 = critILevel([{ redListCategory: "LC", keyStoneSpecie: false, effectLocalScale: false, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 4 }])
        expect(lev3_4).toEqual(2);
        const lev2 = critILevel([{ redListCategory: "LC", keyStoneSpecie: false, effectLocalScale: false, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 2 }])
        expect(lev2).toEqual(1);
        const lev1 = critILevel([{ redListCategory: "LC", keyStoneSpecie: false, effectLocalScale: false, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 1 }])
        expect(lev1).toEqual(0);
    })
    it('has expected level for other RL species with locale scale', () => {
        const lev2_4 = critILevel([{ redListCategory: "LC", keyStoneSpecie: false, effectLocalScale: true, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 4 }])
        expect(lev2_4).toEqual(1);
        const lev1 = critILevel([{ redListCategory: "LC", keyStoneSpecie: false, effectLocalScale: true, parasiteNewForHost: true, parasiteIsAlien: false, parasiteEcoEffect: 1 }])
        expect(lev1).toEqual(0);
    })
    it('has expected level for not new parisites without locale scale', () => {
        const lev2_4 = critILevel([{ effectLocalScale: false, parasiteNewForHost: false, parasiteIsAlien: false, parasiteEcoEffect: 4 }])
        expect(lev2_4).toEqual(1);
        const lev1 = critILevel([{ effectLocalScale: false, parasiteNewForHost: false, parasiteIsAlien: false, parasiteEcoEffect: 1 }])
        expect(lev1).toEqual(0);
    })
    it('has expected level for not new parisites with locale scale', () => {
        const lev1 = critILevel([{ effectLocalScale: true, parasiteNewForHost: false, parasiteIsAlien: false, parasiteEcoEffect: 4 }])
        expect(lev1).toEqual(0);
    })
    it('returns highest level when multiple rows', () => {
        const lev = critILevel([
            { parasiteIsAlien: true, parasiteEcoEffect: 1 },
            { parasiteIsAlien: true, parasiteEcoEffect: 3 },
            { parasiteIsAlien: true, parasiteEcoEffect: 2 }
        ])
        expect(lev).toEqual(2);
    })

});


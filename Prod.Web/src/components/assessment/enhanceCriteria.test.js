import {critILevel} from './enhanceCriteria'

describe('enhanceCriteria crit I Level', () => {
  it('has default level with no rows', () => {
    const lev = critILevel([])
    expect(lev).toEqual(0);
  })
  it('has expected level with ParasiteIsAlien', () => {
    const lev4 = critILevel([{ParasiteIsAlien: true, ParasiteEcoEffect: 4}])
    expect(lev4).toEqual(3);
    const lev3 = critILevel([{ParasiteIsAlien: true, ParasiteEcoEffect: 3}])
    expect(lev3).toEqual(2);
    const lev2 = critILevel([{ParasiteIsAlien: true, ParasiteEcoEffect: 2}])
    expect(lev2).toEqual(1);
    const lev1 = critILevel([{ParasiteIsAlien: true, ParasiteEcoEffect: 1}])
    expect(lev1).toEqual(0);
  })
  it('has expected level for threathened species without locale scale', () => {
    const lev4 = critILevel([{RedListCategory: "CR", EffectLocalScale: false,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 4}])
    expect(lev4).toEqual(3);
    const lev2 = critILevel([{RedListCategory: "CR", EffectLocalScale: false,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 2}])
    expect(lev2).toEqual(1);
  })
  it('has expected level for threathened species with locale scale', () => {
    const lev3_4 = critILevel([{RedListCategory: "CR", EffectLocalScale: true,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 4}])
    expect(lev3_4).toEqual(2);
    const lev2 = critILevel([{RedListCategory: "CR", EffectLocalScale: true,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 2}])
    expect(lev2).toEqual(1);
  })
  it('has expected level for other keystone RL species with locale scale', () => {
    const lev3_4 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: true, EffectLocalScale: true,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 4}])
    expect(lev3_4).toEqual(2);
    const lev2 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: true, EffectLocalScale: true,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 2}])
    expect(lev2).toEqual(1);
    const lev1 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: true, EffectLocalScale: true,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 1}])
    expect(lev1).toEqual(0);
  })
  it('has expected level for other RL species without locale scale', () => {
    const lev3_4 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: false, EffectLocalScale: false,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 4}])
    expect(lev3_4).toEqual(2);
    const lev2 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: false, EffectLocalScale: false,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 2}])
    expect(lev2).toEqual(1);
    const lev1 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: false, EffectLocalScale: false,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 1}])
    expect(lev1).toEqual(0);
  })
  it('has expected level for other RL species with locale scale', () => {
    const lev2_4 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: false, EffectLocalScale: true,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 4}])
    expect(lev2_4).toEqual(1);
    const lev1 = critILevel([{RedListCategory: "LC", KeyStoneSpecie: false, EffectLocalScale: true,ParasiteNewForHost: true, ParasiteIsAlien: false, ParasiteEcoEffect: 1}])
    expect(lev1).toEqual(0);
  })
  it('has expected level for not new parisites without locale scale', () => {
    const lev2_4 = critILevel([{ EffectLocalScale: false,ParasiteNewForHost: false, ParasiteIsAlien: false, ParasiteEcoEffect: 4}])
    expect(lev2_4).toEqual(1);
    const lev1 = critILevel([{ EffectLocalScale: false,ParasiteNewForHost: false, ParasiteIsAlien: false, ParasiteEcoEffect: 1}])
    expect(lev1).toEqual(0);
  })
  it('has expected level for not new parisites with locale scale', () => {
    const lev1 = critILevel([{ EffectLocalScale: true,ParasiteNewForHost: false, ParasiteIsAlien: false, ParasiteEcoEffect: 4}])
    expect(lev1).toEqual(0);
  })
  it('returns highest level when multiple rows', () => {
    const lev = critILevel([
      {ParasiteIsAlien: true, ParasiteEcoEffect: 1},
      {ParasiteIsAlien: true, ParasiteEcoEffect: 3},
      {ParasiteIsAlien: true, ParasiteEcoEffect: 2}
    ])
    expect(lev).toEqual(2);
  })

});


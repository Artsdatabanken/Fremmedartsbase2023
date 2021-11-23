import { action } from "mobx";
import SvgShapeSelector from "./svg/SvgShapeSelector";
import Legend from "./svg/Legend";
import LegendItem from "./svg/LegendItem";
import React from "react";
import fylker from "./fylker_2017";
import boundary from "./map_2017";
import categories from "./category";
import DiagonalHatch from "./DiagonalHatch";
import { UserContext } from "../observableComponents";

const regionSortering = [
  { "navn": "Bs" },
  { "navn": "Bn" },
  { "navn": "Gh" },
  { "navn": "Nh" },
  { "navn": "Ns" },
  { },
  { "navn": "Jm" },
  { "navn": "Sv"},
  { },
  { "navn": "Fi" },
  { "navn": "Tr" },
  { "navn": "No" },
  // { "navn": "Tø" },
  { "navn": "Nt" },
  { "navn": "St" },
  { "navn": "Mr" },
  { "navn": "Sf" },
  { "navn": "Ho" },
  { "navn": "Ro" },
  { "navn": "Va" },
  { "navn": "Aa" },
  { "navn": "Te" },
  { "navn": "Ve" },
  { "navn": "Bu" },
  { "navn": "Op" },
  { "navn": "He" },
  { "navn": "OsA" },
  { "navn": "Øs" }
];

const Fylkesforekomst = ({ fylkesforekomster }) => {
  const forekomsterAsObject = fylkesforekomster.reduce((acc, e) => {
    acc[e.fylke] = {
      // state: e.state,
      state0: e.state0,
      state1: e.state1,
      state2: e.state2,
      state3: e.state3,
    };
    return acc;
  }, {});
  const context = UserContext.getContext();

  const handleSwitchCategory = (e, fylke, state, value) => {
    if (context.readonly) return;
    for (var ff of fylkesforekomster)
      if (ff.fylke === fylke) {
        switch (state) {
          case 0:
            ff.state0 = value ? 0 : 1;
            if (ff.state0 === 1 && ff.state2 === 1) ff.state2 = 0;
            break;
          case 1:
            ff.state1 = value ? 0 : 1;
            if (ff.state1 === 1 && ff.state2 === 1) ff.state2 = 0;
            break;
          case 2:
            ff.state2 = value ? 0 : 1;
            if (ff.state2 === 0) break;
            ff.state0 = 0;
            ff.state1 = 0;
            ff.state3 = 0;
            break;
          case 3:
            ff.state3 = value ? 0 : 1;
            if (ff.state3 === 1 && ff.state2 === 1) ff.state2 = 0;
            break
        }
        if ((parseInt(ff.state0) + parseInt(ff.state1) + parseInt(ff.state3)) > 0) ff.state2 = 0
        else ff.state2 = 1
        break;
      }
  };

  const specificCategories = (state) => {
    switch (state) {
      case 0:
        const cat0_2 = Object.assign(categories[2], {});
        cat0_2.y = 68;
        return {
          0: categories[0],
          2: cat0_2,
        }
      case 1:
        const cat1_1 = Object.assign(categories[1], {});
        const cat1_2 = Object.assign(categories[2], {});
        cat1_1.y = 14;
        cat1_2.y = 68;
        return {
          1: cat1_1,
          2: cat1_2,
        }
      case 3:
        const cat3_3 = Object.assign(categories[3], {});
        const cat3_2 = Object.assign(categories[2], {});
        cat3_3.y = 14;
        cat3_2.y = 68;
        return {
          3: cat3_3,
          2: cat3_2,
        }
    }
  }

  const regionDefs = Object.keys(fylker).map(kode => {
    const curState = forekomsterAsObject[kode] || 0;
    const state = categories[curState.state];
    return {
      kode,
      // title: `${fylker[kode]}: ${state.title}`,
      title: `${fylker[kode]}`,
      style: state
    };
  });

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "50% 50%"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "max-content repeat(4, min-content)",
            columnGap: 8,
            marginLeft: 24,
            width: 450
          }}
        >
          <div style={{ _paddingBottom: 24 }}></div>
          <FylkeslisteLegend index={0} />
          <FylkeslisteLegend index={1} />
          <FylkeslisteLegend index={3} />
          <FylkeslisteLegend index={2} />
          {regionSortering.map((k, index) => {
            if (k.navn) {
              return (
                <FylkeslisteElement
                  key={k.navn}
                  id={k.navn}
                  values={forekomsterAsObject[k.navn]}
                  onSwitchCategory={action(handleSwitchCategory)}
                  rerenderhack={forekomsterAsObject}
                />
              );
            }
            return <Spacer key={index} />;
          })}
        </div>
        <div style={{ _float: "left" }}>
          <SvgShapeSelector
            categories={categories}
            boundary={boundary}
            onSwitchCategory={action(handleSwitchCategory)}
            regionDefs={regionDefs}
            states={forekomsterAsObject}
            stateIndex={0}
          >
            <DiagonalHatch />
            <Legend size={30} categories={specificCategories(0)} />
          </SvgShapeSelector>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "50% 50%"
        }}
      >
        <div style={{ _float: "left" }}>
          <SvgShapeSelector
            categories={categories}
            boundary={boundary}
            onSwitchCategory={action(handleSwitchCategory)}
            regionDefs={regionDefs}
            states={forekomsterAsObject}
            stateIndex={1}
          >
            <DiagonalHatch />
            <Legend size={30} categories={specificCategories(1)} />
          </SvgShapeSelector>
        </div>
        <div style={{ _float: "right" }}>
          <SvgShapeSelector
            categories={categories}
            boundary={boundary}
            onSwitchCategory={action(handleSwitchCategory)}
            regionDefs={regionDefs}
            states={forekomsterAsObject}
            stateIndex={3}
          >
            <DiagonalHatch />
            <Legend size={30} categories={specificCategories(3)} />
          </SvgShapeSelector>
        </div>
      </div>
    </>
  );
};

const FylkeslisteLegend = ({ index }) => {
  const cat = categories[index];
  return (
    <div style={{ _textAlign: "center", _width: 10, _height: 10 }}>
      <LegendItem
        fill={cat.normal.fill}
        x={1}
        y={1}
        width={21}
        height={21}
        size={16}
      ></LegendItem>
    </div>
  );
};

const FylkeslisteElement = ({ id, values, onSwitchCategory }) => {
  return (
    <>
      <div>{fylker[id]}</div>
      <div>
        <input
          type="checkbox"
          id={id}
          name={id}
          value={0}
          checked={values.state0 == 1}
          onChange={e => onSwitchCategory(e, id, 0, values.state0 == 1)}
        />
      </div>
      <div>
        <input
          type="checkbox"
          id={id}
          name={id}
          value={1}
          checked={values.state1 == 1}
          onChange={e => onSwitchCategory(e, id, 1, values.state1 == 1)}
        />
      </div>
      <div>
        <input
          type="checkbox"
          id={id}
          name={id}
          value={3}
          checked={values.state3 == 1}
          onChange={e => onSwitchCategory(e, id, 3, values.state3 == 1)}
        />
      </div>
      <div>
        <input
          type="checkbox"
          id={id}
          name={id}
          value={2}
          checked={values.state2 == 1}
          onChange={e => onSwitchCategory(e, id, 2, values.state2 == 1)}
        />
      </div>
    </>
  );
};

const Spacer = () => (
  <>
    <div style={{ height: 12 }} />
    <div />
    <div />
    <div />
    <div />
  </>
);

export default Fylkesforekomst;

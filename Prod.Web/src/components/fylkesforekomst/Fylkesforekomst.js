import { action } from "mobx";
import SvgShapeSelector from "./svg/SvgShapeSelector";
import Legend from "./svg/Legend";
import LegendItem from "./svg/LegendItem";
import React from "react";
import fylker from "./fylker";
import boundary from "./map";
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
  { "navn": "Tø" },
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
    acc[e.fylke] = e.state;
    return acc;
  }, {});
  const context = UserContext.getContext();

  const handleSwitchCategory = (e, fylke, state) => {
    // console.log(e, fylke, state);
    if (context.readonly) return;
    for (var ff of fylkesforekomster)
      if (ff.fylke === fylke) {
        ff.state = state;
        break;
      }
  };

  const regionDefs = Object.keys(fylker).map(kode => {
    const curState = forekomsterAsObject[kode] || 0;
    const state = categories[curState];
    return {
      kode,
      title: `${fylker[kode]}: ${state.title}`,
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
                  value={forekomsterAsObject[k.navn]}
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
          >
            <DiagonalHatch />
            <Legend size={37} categories={categories} />
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

const FylkeslisteElement = ({ id, value, onSwitchCategory }) => {
  return (
    <>
      <div>{fylker[id]}</div>
      <div>
        <input
          type="radio"
          id={id}
          name={id}
          value={0}
          checked={value == 0}
          onChange={e => onSwitchCategory(e, id, 0)}
        />
      </div>
      <div>
        <input
          type="radio"
          id={id}
          name={id}
          value={1}
          checked={value == 1}
          onChange={e => onSwitchCategory(e, id, 1)}
        />
      </div>
      <div>
        <input
          type="radio"
          id={id}
          name={id}
          value={3}
          checked={value == 3}
          onChange={e => onSwitchCategory(e, id, 3)}
        />
      </div>
      <div>
        <input
          type="radio"
          id={id}
          name={id}
          value={2}
          checked={value == 2}
          onChange={e => onSwitchCategory(e, id, 2)}
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

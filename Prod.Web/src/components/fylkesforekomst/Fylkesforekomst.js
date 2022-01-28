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

const regionSorteringA = [
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
  { "navn": "Øs" },
  { },
];
const regionSorteringB = [
  { "navn": "Bs" },
  { "navn": "Bn" },
  { "navn": "Gh" },
  { "navn": "Nh" },
  { "navn": "Ns" },
  { },
  { "navn": "Jm" },
  { "navn": "Sv"},
  { },
  { },
  { },
  { },
  { },
  { },
  { },
  { },
  { },
  { },
  { },
  { },
];

const Fylkesforekomst = ({ assessment, fylkesforekomster }) => {
  const forekomsterAsObject = fylkesforekomster.reduce((acc, e) => {
    if (assessment.alienSpeciesCategory == "DoorKnocker") {
      acc[e.fylke] = {
        // state: e.state,
        //state0: e.state0,
       // state1: e.state1,
        state2: e.state2,
        state3: e.state3,
      };
      
    } else {
      acc[e.fylke] = {
        // state: e.state,
        state0: e.state0,
        state1: e.state1,
        state2: e.state2,
        state3: e.state3,
      };
    }
    
    return acc;
  }, {});
  const context = UserContext.getContext();

  const doorKnocker = assessment.alienSpeciesCategory == "DoorKnocker";

  const handleSwitchOtherCategory = (state, fylke) => {
    for (var ff of assessment.fylkesforekomster) {
      if (ff.fylke !== fylke) continue;
      setFylkeState(ff, parseInt(state), ff[`state${state}`] === 1);
    }
  };

  const handleSwitchCategory = (e, fylke, state, value) => {
    if (context.readonly) return;
    for (var ff of fylkesforekomster)
      if (ff.fylke === fylke) {
        setFylkeState(ff, state, value);
        break;
      }
  };

  const setFylkeState = (ff, state, value) => {
    // state0 - kjent
    // state1 - antatt i dag
    // state2 - ingen
    // state3 - antatt om 50 år
    switch (state) {
      case 0:
      case 1:
      case 3:
        ff[`state${state}`] = value ? 0 : 1;
        if (ff[`state${state}`] === 1 && ff.state2 === 1) ff.state2 = 0;

        // state0 - set state1 & 3
        // state1 - set state3
        if (!value) {
          switch (state) {
            case 0:
              ff.state1 = 1;
            case 1:
              ff.state3 = 1;
              break;
          }
        }
        break;
      case 2:
        ff[`state${state}`] = value ? 0 : 1;
        if (ff[`state${state}`] === 0) break;
        ff.state0 = 0;
        ff.state1 = 0;
        ff.state3 = 0;
        break;
      default:
        console.log('unknown', state);
    }
    if ((parseInt(ff.state0) + parseInt(ff.state1) + parseInt(ff.state3)) > 0) ff.state2 = 0;
    else ff.state2 = 1;
  };
  
  const allCategories = () => {
    const createClonedCategory = (cat, y) => {
      return {
        highlight: cat.highlight,
        normal: cat.normal,
        title: cat.title,
        tooltip: cat.tooltip,
        x: cat.x,
        y: y ? y : cat.y,
        showRect: true
      };
    }
    const cat0 = createClonedCategory(categories[0], 48);
    const cat1 = createClonedCategory(categories[1], 82);
    const cat3 = createClonedCategory(categories[3], 116);
    const cat2 = createClonedCategory(categories[2], 14);
    return {
      0: cat0,
      1: cat1,
      3: cat3,
      2: cat2
    }
  }

  const specificCategories = (state) => {
    switch (state) {
      case 0:
        const cat0_1 = Object.assign(categories[0], {});
        // const cat0_2 = Object.assign(categories[2], {});
        // cat0_2.y = 68;
        cat0_1.y = 14;
        cat0_1.showRect = false;
        return {
          0: cat0_1,
          // 2: cat0_2,
        }
      case 1:
        const cat1_1 = Object.assign(categories[1], {});
        // const cat1_2 = Object.assign(categories[2], {});
        cat1_1.y = 14;
        // cat1_2.y = 68;
        cat1_1.showRect = false;
        return {
          1: cat1_1,
          // 2: cat1_2,
        }
      case 3:
        const cat3_3 = Object.assign(categories[3], {});
        // const cat3_2 = Object.assign(categories[2], {});
        cat3_3.y = 14;
        // cat3_2.y = 68;
        cat3_3.showRect = false;
        return {
          3: cat3_3,
          // 2: cat3_2,
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
            gridTemplateColumns: doorKnocker ? "max-content repeat(2, min-content)" : "max-content repeat(4, min-content)",
            columnGap: 8,
            marginLeft: 24,
            width: 450
          }}
        >
          <div style={{ _paddingBottom: 24 }}></div>
          {!doorKnocker && <>
          <FylkeslisteLegend index={0} disabled={context.readonly}/>
          <FylkeslisteLegend index={1} disabled={context.readonly}/>
          </>
           }
          <FylkeslisteLegend index={3} disabled={context.readonly} />
          <FylkeslisteLegend index={2} disabled={context.readonly}/>
          
          {regionSorteringA.map((k, index) => {
            if (k.navn) {
              return (
                <FylkeslisteElement
                  key={k.navn}
                  id={k.navn}
                  values={forekomsterAsObject[k.navn]}
                  doorKnocker={doorKnocker}
                  onSwitchCategory={action(handleSwitchCategory)}
                  rerenderhack={forekomsterAsObject}
                />
              );
            }
            return <Spacer key={index} />;
          })}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: doorKnocker ? "max-content repeat(2, min-content)" : "max-content repeat(4, min-content)",
            columnGap: 8,
            marginLeft: 24,
            width: 450
          }}
        >
          <div style={{ _paddingBottom: 24 }}></div>
          {!doorKnocker && <>
          <FylkeslisteLegend index={0} />
          <FylkeslisteLegend index={1} />
          </>
           }
          <FylkeslisteLegend index={3} />
          <FylkeslisteLegend index={2} />
          
          {regionSorteringB.map((k, index) => {
            if (k.navn) {
              return (
                <FylkeslisteElement
                  key={k.navn}
                  id={k.navn}
                  doorKnocker={doorKnocker}
                  values={forekomsterAsObject[k.navn]}
                  onSwitchCategory={action(handleSwitchCategory)}
                  rerenderhack={forekomsterAsObject}
                />
              );
            }

            if(doorKnocker) {
              return <DoorKnockerSpacer key={index} />;
            } else {
              return <Spacer key={index} />;
            }
            
          })}
          <div style={{position: "relative", top: -35, left: -24}}>
            <Legend size={18} categories={allCategories()} />
            {/* <FylkeslisteLegend index={0} />
            <FylkeslisteLegend index={1} />
            <FylkeslisteLegend index={3} />
            <FylkeslisteLegend index={2} /> */}
          </div>
        </div>
      </div>
      <div
      className = {doorKnocker ? "doorKnockerSpread" : ""}
        style={{
          display: "grid",
          gridTemplateColumns: "33% 33% 33%"
        }}
      >
        {!doorKnocker && <>
        
        <div style={{ marginRight: -80, _float: "left" }}>
          <SvgShapeSelector
            categories={categories}
            boundary={boundary}
            onSwitchCategory={action(handleSwitchCategory)}
            onSwitchOtherCategory={action(handleSwitchOtherCategory)}
            regionDefs={regionDefs}
            states={forekomsterAsObject}
            stateIndex={0}
            disabled={context.readonly}
          >
            <DiagonalHatch />
            <Legend size={35} categories={specificCategories(0)} />
          </SvgShapeSelector>
        </div>
        <div style={{ marginLeft: -40, marginRight: -40, _float: "middle" }}>
          <SvgShapeSelector
            categories={categories}
            boundary={boundary}
            onSwitchCategory={action(handleSwitchCategory)}
            onSwitchOtherCategory={action(handleSwitchOtherCategory)}
            regionDefs={regionDefs}
            states={forekomsterAsObject}
            stateIndex={1}
            disabled={context.readonly}
          >
            <DiagonalHatch />
            <Legend size={35} categories={specificCategories(1)} />
          </SvgShapeSelector>
        </div>

        </>
        }
        <div style={{ marginLeft: -80, _float: "right" }}>
          <SvgShapeSelector
            categories={categories}
            boundary={boundary}
            onSwitchCategory={action(handleSwitchCategory)}
            onSwitchOtherCategory={action(handleSwitchOtherCategory)}
            regionDefs={regionDefs}
            states={forekomsterAsObject}
            stateIndex={3}
            disabled={context.readonly}
          >
            <DiagonalHatch />
            <Legend size={35} categories={specificCategories(3)} />
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
        showRect={true}
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

const FylkeslisteElement = ({ id, values, onSwitchCategory, doorKnocker}) => {
  return (
    <>
      <div>{fylker[id]}</div>
      {!doorKnocker && <>
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
      </>}
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
    <div style={{ height: 24 }} />
    <div />
    <div />
    <div />
    <div />      
  </>
);

const DoorKnockerSpacer = () => (    
  <>
    <div style={{ height: 24 }} />
    <div />
    <div />     
  </>
);

export default Fylkesforekomst;

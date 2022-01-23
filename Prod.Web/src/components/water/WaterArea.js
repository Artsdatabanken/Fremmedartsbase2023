import { action } from "mobx";
import React, { useState } from "react";
import { UserContext } from "../observableComponents";
import LegendItem from "../fylkesforekomst/svg/LegendItem";
import categories from "../fylkesforekomst/category";

const WaterArea = ({
  assessment,
  onWaterCheck
}) => {

  let regionSortering = [];
  let regionSorteringA = [];
  let regionSorteringB = [];
  const waterAsObject = {};

  if (assessment.artskartWaterModel.areas) {
    assessment.artskartWaterModel.areas.forEach(e => {
      regionSortering.push({"navn": e.name, "vannregionID": e.vannregionID});
      waterAsObject[e.name] = {
        globalID: e.globalID,
        vannregionID: e.vannregionID,
        disabled: e.disabled,
        state0: e.state0,
        state1: e.state1,
        state2: e.state2,
        state3: e.state3,
      };
    });
    regionSortering.sort((a,b) => (a.vannregionID > b.vannregionID) ? 1 : ((b.vannregionID > a.vannregionID) ? -1 : 0));
    let prevId;
    const split = assessment.artskartWaterModel.areas.length > 50;
    const columnSize = Math.ceil(assessment.artskartWaterModel.areas.length / 2);
    regionSortering.forEach(e => {
      let spacer = (prevId !== undefined && prevId !== e.vannregionID) ? true : false;
      if (!split || regionSorteringA.length < columnSize) {
        if (split && spacer) regionSorteringA.push({});
        regionSorteringA.push(e);
      } else {
        if (spacer) regionSorteringB.push({});
        regionSorteringB.push(e);
      }
      prevId = e.vannregionID;
      if (regionSorteringA.length === columnSize) prevId = undefined;
    });
  }
  // console.log('regionSorteringA', regionSorteringA)
  // console.log('waterAsObject', waterAsObject)

  const isDisabled = (k) => {
    return waterAsObject[k].disabled === 1;
  }

  const context = UserContext.getContext();

  const doorKnocker = assessment.alienSpeciesCategory == "DoorKnocker";

  const handleSwitchCategory = (e, area, state, value) => {
    if (context.readonly) return;
    // console.log('check?', area, state, value)
    setWaterState(waterAsObject[area], state, value);
  };

  const setWaterState = (ff, state, value) => {
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
    onWaterCheck({waterObject: ff, state, value});
  };
  
  // const specificCategories = (state) => {
  //   switch (state) {
  //     case 0:
  //       const cat0_2 = Object.assign(categories[2], {});
  //       cat0_2.y = 68;
  //       return {
  //         0: categories[0],
  //         2: cat0_2,
  //       }
  //     case 1:
  //       const cat1_1 = Object.assign(categories[1], {});
  //       const cat1_2 = Object.assign(categories[2], {});
  //       cat1_1.y = 14;
  //       cat1_2.y = 68;
  //       return {
  //         1: cat1_1,
  //         2: cat1_2,
  //       }
  //     case 3:
  //       const cat3_3 = Object.assign(categories[3], {});
  //       const cat3_2 = Object.assign(categories[2], {});
  //       cat3_3.y = 14;
  //       cat3_2.y = 68;
  //       return {
  //         3: cat3_3,
  //         2: cat3_2,
  //       }
  //   }
  // }

  // const regionDefs = Object.keys(fylker).map(kode => {
  //   const curState = waterAsObject[kode] || 0;
  //   // const state = categories[curState.state];
  //   return {
  //     kode,
  //     // title: `${fylker[kode]}: ${state.title}`,
  //     title: `${fylker[kode]}`,
  //     // style: state
  //   };
  // });

  // console.log('render', waterAsObject)

  let previousRegion = null;
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
          <ListeLegend index={0} disabled={context.readonly}/>
          <ListeLegend index={1} disabled={context.readonly}/>
          </>
           }
          <ListeLegend index={3} disabled={context.readonly} />
          <ListeLegend index={2} disabled={context.readonly}/>
          
          {regionSorteringA.map((k, index) => {
            if (k.navn) {
              return (
                <ListeElement
                  key={k.navn}
                  id={k.navn}
                  subTitle={k.vannregionID}
                  disabled={isDisabled(k.navn)}
                  values={waterAsObject[k.navn]}
                  doorKnocker={doorKnocker}
                  onSwitchCategory={action(handleSwitchCategory)}
                  rerenderhack={waterAsObject}
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
            // marginLeft: 24,
            marginLeft: 0,
            width: 450
          }}
        >
          <div style={{ _paddingBottom: 24 }}></div>
          {!doorKnocker && <>
          <ListeLegend index={0} />
          <ListeLegend index={1} />
          </>
           }
          <ListeLegend index={3} />
          <ListeLegend index={2} />
          
          {regionSorteringB.map((k, index) => {
            if (k.navn) {
              return (
                <ListeElement
                  key={k.navn}
                  id={k.navn}
                  subTitle={k.vannregionID}
                  doorKnocker={doorKnocker}
                  values={waterAsObject[k.navn]}
                  onSwitchCategory={action(handleSwitchCategory)}
                  rerenderhack={waterAsObject}
                />
              );
            }

            if(doorKnocker) {
              return <DoorKnockerSpacer key={index} />;
            } else {
              return <Spacer key={index} />;
            }
            
          })}
        </div>
      </div>
    </>
  );
};

const ListeLegend = ({ index }) => {
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

const ListeElement = ({ id, subTitle, disabled, values, onSwitchCategory, doorKnocker}) => {
  return (
    <>
      {/* <div>{fylker[id]}</div> */}
      <div title={subTitle}>{id}</div>
      {!doorKnocker && <>
      <div>
        <input
          type="checkbox"
          id={id}
          name={id}
          value={0}
          disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
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

export default WaterArea;

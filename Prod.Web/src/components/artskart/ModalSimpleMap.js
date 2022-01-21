import React, { useEffect, useRef, useState } from "react";
import SimpleMap from "../map/SimpleMap";
import * as Xcomp from "../observableComponents";

const ModalSimpleMap = ({
  evaluationContext,
  labels,
  onOverførFraSimpleMap,
  isWaterArea,
  initialWaterAreas,
  assessmentArea
}) => {
  const ref = useRef();
  const [visSimpleMap, setVisSimpleMap] = useState(false);
  const [waterFeatures, setWaterFeatures] = useState(isWaterArea ? initialWaterAreas.waterArea : initialWaterAreas.waterRegion);
  const [newIsWaterArea, setIsWaterArea] = React.useState(isWaterArea === undefined ? false : isWaterArea);
  const [selectAll, setSelectAll] = React.useState(false);
  let selectedItems;

  const onClick = ({name, properties, selected}) => {
    console.log('click', name, properties, selected);
  }

  const onChange = (items) => {
    // console.log('selected', items);
    selectedItems = items;
  }

  return visSimpleMap ? (
    <div className="artskartmodal" ref={ref}>
      <div style={{
          position: "absolute",
          top: 16,
          right: 56,
          float: "right",
          zIndex: 1000
        }}>
        <Xcomp.Button
          alwaysEnabled = {true}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setVisSimpleMap(false);
          }}
        >
          ✘ Lukk uten å lagre
        </Xcomp.Button>
      </div>
      <div style={{
        pointerEvents: 'auto',
        float: 'left',
        position: 'absolute',
        left: 16,
        top: 66,
        zIndex: 1000
        }}>
        <div>Vurderingsområde</div>
        <div>
          <span>Viser {newIsWaterArea ? 'vannområder' : 'vannregioner'} </span>
          <Xcomp.Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setSelectAll(false);
              setWaterFeatures(!newIsWaterArea ? initialWaterAreas.waterArea : initialWaterAreas.waterRegion);
              setIsWaterArea(!newIsWaterArea);
            }}
            >
            Bytt til {!newIsWaterArea ? 'vannområder' : 'vannregioner'}
          </Xcomp.Button>
        </div>
        <div>
          {/* <Xcomp.Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setSelectAll(!selectAll);
            }}
            >
            {!selectAll ? 'Velg alle' : 'Velg ingen'}
          </Xcomp.Button> */}
          <Xcomp.Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onOverførFraSimpleMap({ selectedItems, newIsWaterArea });
              setVisSimpleMap(false);
            }}
            >
            Overfør områder
          </Xcomp.Button>
        </div>
      </div>
      <div style={{ height: "100%" }}>
        <SimpleMap
          static={false}
          mapIndex={0}
          selectAll={selectAll}
          isWaterArea={newIsWaterArea}
          waterFeatures={waterFeatures}
          evaluationContext={evaluationContext}
          labels={labels}
          selectedArea={assessmentArea}
          onClick={onClick}
          onChange={onChange}
          />
      </div>
    </div>
  ) : (
    <div>
      <span>{labels.goTo}</span> <Xcomp.Button primary onClick={() => setVisSimpleMap(true)} alwaysEnabled={true}>{labels.speciesMap}</Xcomp.Button>
    </div>
  );
};

export default ModalSimpleMap;

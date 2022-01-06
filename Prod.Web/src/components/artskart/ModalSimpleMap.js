import React, { useEffect, useRef, useState } from "react";
import SimpleMap from "../map/SimpleMap";
import * as Xcomp from "../observableComponents";

const ModalSimpleMap = ({
  evaluationContext,
  labels,
  onOverførFraSimpleMap
}) => {
  const ref = useRef();
  const [visSimpleMap, setVisSimpleMap] = useState(false);
  const [showRegion, setShowRegion] = React.useState(true);
  const [selectAll, setSelectAll] = React.useState(false);

  const onClick = ({name, properties, selected}) => {
    console.log('you clicked:', name, properties, selected);
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
          <span>Viser {showRegion ? 'vannregioner' : 'vannområder'} </span>
          <Xcomp.Button
            onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setSelectAll(false);
            setShowRegion(!showRegion);
            }}
            >
            Bytt til {!showRegion ? 'vannregioner' : 'vannområder'}
          </Xcomp.Button>
        </div>
        <div>
          <Xcomp.Button
            onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setSelectAll(!selectAll);
            }}
            >
            {!selectAll ? 'Velg alle' : 'Velg ingen'}
          </Xcomp.Button>
        </div>
      </div>
      <div style={{ height: "100%" }}>
        <SimpleMap
          modal={true}
          static={false}
          selectAll={selectAll}
          showRegion={showRegion}
          evaluationContext={evaluationContext}
          labels={labels}
          onClick={onClick}
          onOverførFraSimpleMap={onOverførFraSimpleMap}
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

import React, { useRef, useState } from "react";
import SimpleMap from "../map/SimpleMap";
import * as Xcomp from "../observableComponents";

const ModalSimpleMap = ({
  evaluationContext,
  showRegion,
  labels,
  onOverførFraSimpleMap
}) => {
  const ref = useRef();
  const [visSimpleMap, setVisSimpleMap] = useState(false);

  const onClick = ({name, properties}) => {
    console.log('you clicked:', name, properties);
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
      <div style={{ height: "100%" }}>
        <SimpleMap
            modal={true}
            static={false}
            evaluationContext={evaluationContext}
            showRegion={showRegion}
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

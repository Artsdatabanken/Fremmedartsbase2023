import React from "react";
import mapstyle from "./mapstyle";
import Utvalg from "./Utvalg";
import RedigerbartKart from "./RedigerbartKart";
import * as Xcomp from "../observableComponents";

const mapBounds = {
  S: [
    [73, 13],
    [83, 23]
  ],
  N: [
    [57, 4.3],
    [71.5, 32.5]
  ]
};

const Artskart = ({
  taxonId,
  scientificNameId,
  evaluationContext,
  utvalg,
  artskartModel,
  showWaterAreas,
  artskartWaterModel,
  waterFeatures,
  onOverførFraArtskart,
  artskartSelectionGeometry,
  artskartAdded,
  artskartRemoved,
  onCancel
}) => {
  // console.log('Artskart', taxonId, scientificNameId, evaluationContext);
  return (
    <div className="artskartmodal">
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 56,
          float: "right",
          zIndex: 1000
        }}
      >
        <Utvalg utvalg={utvalg} artskartModel={artskartModel} />
        <Xcomp.Button
          alwaysEnabled = {true}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
        >
          ✘ Lukk uten å lagre
        </Xcomp.Button>
      </div>

      <RedigerbartKart
        artskartModel={artskartModel}
        showWaterAreas={showWaterAreas}
        artskartWaterModel={artskartWaterModel}
        waterFeatures={waterFeatures}
        taxonId={taxonId || 0}
        scientificNameId={scientificNameId}
        kriterier={{ ...utvalg }}
        mapstyle={mapstyle}
        mapBounds={mapBounds[evaluationContext]}
        onOverførFraArtskart={onOverførFraArtskart}
        artskartAdded={artskartAdded}
        artskartRemoved={artskartRemoved}
        artskartSelectionGeometry={artskartSelectionGeometry}
        onCancel={onCancel}
      ></RedigerbartKart>
    </div>
  );
};

export default Artskart;

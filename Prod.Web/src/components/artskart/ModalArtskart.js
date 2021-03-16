import React, { useRef, useState } from "react";
import * as Xcomp from "../observableComponents";
import Artskart from "./Artskart";
import useEscapeKey from "./useEscapeKey";

const ModalArtskart = ({
  vurderingsContext,
  latinsknavnId,
  taxonId,
  utvalg,
  artskartAdded,
  artskartRemoved,
  artskartSelectionGeometry,
  onOverførFraArtskart
}) => {
  const ref = useRef();
  const [visArtskart, setVisArtskart] = useState(false);
  useEscapeKey(ref, () => setVisArtskart(false));
  return (
    <div ref={ref}>
      {visArtskart && (
        <Artskart
          vurderingsContext={vurderingsContext}
          onSave={resultat => this.handleSave(resultat)}
          onCancel={() => setVisArtskart(false)}
          taxonId={taxonId || 0}
          scientificNameId={latinsknavnId}
          utvalg={utvalg}
          onOverførFraArtskart={onOverførFraArtskart}
          artskartAdded={artskartAdded}
          artskartRemoved={artskartRemoved}
          artskartSelectionGeometry={artskartSelectionGeometry}
        />
      )}
      <div style={{ paddingBottom: 16, display: 'flex' }}>
        <Xcomp.Button primary onClick={() => setVisArtskart(true)} alwaysEnabled={true}>
          Hent fra Artskart...
        </Xcomp.Button> <p style={{ paddingTop: 20 }}>(brukes til beregning av kjent utbredelsesområde, kjent forekomstareal og kjent fylkesforekomst)</p>
      </div>
    </div>
  );
};

export default ModalArtskart;

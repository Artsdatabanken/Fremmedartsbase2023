import React, { useRef, useState } from "react";
import * as Xcomp from "../observableComponents";
import Artskart from "./Artskart";
// import useEscapeKey from "./useEscapeKey";

const ModalArtskart = ({
    labels,
    evaluationContext,
    showWaterAreas,
    artskartWaterModel,
    waterFeatures,
    scientificNameId,
    taxonId,
    utvalg,
    artskartModel,
    artskartAdded,
    artskartRemoved,
    artskartSelectionGeometry,
    onOverførFraArtskart,
    showTransferRegionlist,
    token,
}) => {
    const ref = useRef();
    const [visArtskart, setVisArtskart] = useState(false);
    // useEscapeKey(ref, () => setVisArtskart(false));

    return visArtskart ? (
        <div ref={ref}>
            <Artskart
                evaluationContext={evaluationContext}
                onSave={(resultat) => this.handleSave(resultat)}
                onCancel={() => setVisArtskart(false)}
                showWaterAreas={showWaterAreas}
                artskartWaterModel={artskartWaterModel}
                waterFeatures={waterFeatures}
                taxonId={taxonId || 0}
                scientificNameId={scientificNameId}
                utvalg={utvalg}
                artskartModel={artskartModel}
                onOverførFraArtskart={onOverførFraArtskart}
                artskartAdded={artskartAdded}
                artskartRemoved={artskartRemoved}
                artskartSelectionGeometry={artskartSelectionGeometry}
                showTransferRegionlist={showTransferRegionlist}
                token={token}
            />
            )
        </div>
    ) : (
        <div>
            <span>{labels.goTo}</span>{" "}
            <Xcomp.Button
                primary
                onClick={() => setVisArtskart(true)}
                alwaysEnabled={true}
            >
                {labels.speciesMap}
            </Xcomp.Button>
        </div>
    );
    // return (
    //   <div ref={ref}>
    //     {visArtskart && (
    //       <Artskart
    //         vurderingsContext={vurderingsContext}
    //         onSave={resultat => this.handleSave(resultat)}
    //         onCancel={() => setVisArtskart(false)}
    //         taxonId={taxonId || 0}
    //         scientificNameId={scientificNameId}
    //         utvalg={utvalg}
    //         onOverførFraArtskart={onOverførFraArtskart}
    //         artskartAdded={artskartAdded}
    //         artskartRemoved={artskartRemoved}
    //         artskartSelectionGeometry={artskartSelectionGeometry}
    //       />
    //     )}
    //     <div style={{ paddingBottom: 16, display: 'flex' }}>
    //       <Xcomp.Button primary onClick={() => setVisArtskart(true)} alwaysEnabled={true}>
    //         Hent fra Artskart...
    //       </Xcomp.Button> <p style={{ paddingTop: 20 }}>(brukes til beregning av kjent utbredelsesområde, kjent forekomstareal og kjent fylkesforekomst)</p>
    //     </div>
    //   </div>
    // );
};

export default ModalArtskart;

import React, { useEffect, useRef } from "react";
import * as Xcomp from "../observableComponents";

const Artskartparametre = ({ utvalg }) => {
  const inputRef = useRef(null);
  useEffect(() => inputRef.current.focus(), []);
  return (
    <div
      ref={inputRef}
      tabIndex={1}
      style={{
        backgroundColor: "#e9f2f1",
        width: 262,
        padding: 16,
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)"
      }}
    >
      {/* <Xcomp.Number
        label="Fra og med måned"
        width="4em"
        observableValue={[utvalg, "fromMonth"]}
        integer
        domref={inputRef}
      />
      <Xcomp.Number
        label="Til og med måned"
        width="4em"
        observableValue={[utvalg, "toMonth"]}
        integer
      /> */}

      <Xcomp.Number
        label="Fra og med år"
        width="5em"
        // observableValue={[utvalg, "observationFromYear"]}
        observableValue={[utvalg, "AOOyear1"]}
        integer
      />
      <Xcomp.Number
        label="Til og med år"
        width="5em"
        // observableValue={[utvalg, "observationToYear"]}
        observableValue={[utvalg, "AOOyear2"]}
        integer
      />

      <Xcomp.Bool label="I Norge" observableValue={[utvalg, "includeNorge"]} />
      <Xcomp.Bool
        label="På Svalbard"
        observableValue={[utvalg, "includeSvalbard"]}
      />
      <hr/>
      <Xcomp.Bool
        label="ekskluder funn uten belegg"
        observableValue={[!utvalg, "includeObservations"]}
      />
      {/* <Xcomp.Bool
        label="objekter"
        observableValue={[utvalg, "includeObjects"]}
      />
      <Xcomp.Bool
        label="observasjoner"
        observableValue={[utvalg, "includeObservations"]}
      /> */}
      <Xcomp.Bool
        label="ekskluder GBIF"
        observableValue={[utvalg, "excludeGbif"]}
      />
    </div>
  );
};

export default Artskartparametre;

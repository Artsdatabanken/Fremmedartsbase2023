import React, { useEffect, useState } from "react";
import MapOpenLayers from "../map/MapOpenLayers";
import Loading from "../Loading";
import useArtskart from "./useArtskart";
import * as Xcomp from "../observableComponents";

const RedigerbartKart = ({
  showWaterAreas,
  taxonId,
  scientificNameId,
  kriterier,
  mapstyle,
  mapBounds,
  onOverførFraArtskart,
  artskartSelectionGeometry,
  artskartAdded,
  artskartRemoved,
  onCancel,
  children
}) => {
  const [selectionGeometry, setSelectionGeometry] = React.useState(artskartSelectionGeometry);
  const [
    artskart,
    observations,
    areadata,
    countylist,
    handleAddPoint,
    handleClickPoint
  ] = useArtskart({
    taxonId,
    scientificNameId,
    kriterier,
    selectionGeometry,
    artskartAdded,
    artskartRemoved,
  });
  // console.log('RedigerbartKart', artskartAdded, artskartRemoved, taxonId, scientificNameId);

  const handleEditSelection = e => {
    setSelectionGeometry(e);
  };

  const [hoverInfo, setHoverInfo] = useState('');
  const onHover = (info) => {
    setHoverInfo(info);
  }

  const [editStats, setEditStats] = useState({});
  useEffect(() => {
    async function summarize() {
      const editStats = observations.features.reduce(
        (acc, e) => {
          if (e.source === "add" && e.category === "inside") acc.add++;
          if (e.source === "remove") acc.remove++;
          return acc;
        },
        { add: 0, remove: 0 }
      );
      setEditStats(editStats);
    }
    summarize();
  }, [observations]);

  return (
    <div style={{ height: "100%" }}>
      {children}
      <div style={{ pointerEvents: 'none', position: "absolute", zIndex: 500, top: 24, left: 24, maxWidth: 777 }}>
        <h3>Arealer og fylker fra Artskart</h3>
        
        <div>
          Forekomstareal:{" "}
          {areadata.AreaOfOccupancy >= 0 ? (
            <span>
              <b>{areadata.AreaOfOccupancy}</b> km²,{" "}
              <b>{areadata.AreaOfOccupancy / 4}</b> ruter på 2 km x 2 km          
            </span>
          ) : (
              "?"
            )}
          <EditStats {...editStats} />
          {areadata.ExcludedLocalities > 0 && selectionGeometry &&
            <span>. Ekskludert av polygon: <b>{areadata.ExcludedLocalities} ruter. </b></span>}
        </div>
        <div>
          Utbredelsesområde:{" "}
          {areadata.AreaExtentOfOccurrence >= 0 ? (
            <span>
              <b>{areadata.AreaExtentOfOccurrence}</b> km²
            </span>
          ) : (
              "?"
            )}
        </div>
        <div>
          Fylker: <b>{beskrivFylker(countylist)}</b>
            {hoverInfo && (
              <div>Vannområde:{" "}<span><b>{hoverInfo}</b></span></div>
            )}
        </div>
       
        {artskart.error && (
          <div style={{ color: "red", fontWeight: 500 }}>
            Feilmelding fra Artskart: HTTP status {artskart.error.http}{" "}
            {artskart.error.message}
          </div>
        )}
        <div style={{ pointerEvents: 'auto' }}>
          <Xcomp.Button
            disabled={artskart.error || artskart.isLoading}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onOverførFraArtskart({
                selectionGeometry,
                areadata,
                observations,
                editStats,
              });
              onCancel();
            }}
            className={artskart.error || artskart.isLoading ? "" : "elevated"}
          >
            ✓ Overfør kun arealer til vurderingen
          </Xcomp.Button>
          <br/>
          <Xcomp.Button
            disabled={artskart.error || artskart.isLoading}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onOverførFraArtskart({
                countylist,
                selectionGeometry,
                areadata,
                observations,
                editStats
              });
              onCancel();
            }}
            className={artskart.error || artskart.isLoading ? "" : "elevated"}
          >
            ✓ Overfør arealer og fylker tilbake til vurderingen
        </Xcomp.Button>
        {selectionGeometry && <Xcomp.Button
            disabled={artskart.error || artskart.isLoading}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setSelectionGeometry();
              //onCancel();
            }}
            className={artskart.error || artskart.isLoading ? "" : "elevated"}
          >
            Fjern avgrensende polygon
        </Xcomp.Button>}
        </div>
        <div>
          {artskart.isLoading && <Loading style={{ left: 0, top: "100%" }} />}
        </div>
        <div>
          <span>Merk at ruter (2x2km) basert på funn med dårlig geografisk presisjon (&gt; 1000 m) er ekskludert. </span>
            {taxonId ? (
              <a style={{pointerEvents: 'auto'}}
                href={`https://artskart.artsdatabanken.no/app/#map/427864,7623020/3/background/greyMap/filter/${artskartFilter(taxonId, kriterier)}`}
                target="_blank"
              >
              Se Artskart 🔗
              </a>
            ) : (
              <div style={{ color: "red" }}>
                Kan ikke lenke til Artskart fordi vurderingen mangler taxon id
              </div>
            )}
        </div>
      </div>
      <MapOpenLayers
        showWaterAreas={showWaterAreas}
        geojson={observations}
        selectionGeometry={selectionGeometry}
        style={mapstyle}
        onAddPoint={handleAddPoint}
        onClickPoint={handleClickPoint}
        onEdit={handleEditSelection}
        mapBounds={mapBounds}
        onHover={onHover}
      />
    </div>
  );
};

const artskartFilter = (taxonId, kriterier) => {
  let f = `{"TaxonIds":[${taxonId}],"IncludeSubTaxonIds":true,"Found":[2],"NotRecovered":[2],"UnsureId":[2],"Spontan":[2],"Style":1`;
  if (kriterier.AOOyear1 !== undefined) f += `,"YearFrom":"${kriterier.AOOyear1}"`;
  if (kriterier.AOOyear2 !== undefined) f += `,"YearTo":"${kriterier.AOOyear2}"`;
  f += `,"CoordinatePrecisionTo":"1000"}`;
  return encodeURIComponent(f);
}

// Manuelt lagt til 4 ruter og manuelt fjernet 1 rute
const EditStats = ({ add, remove }) => {
  const r = [];
  if (add > 0)
    r.push(
      <span key="add">
        manuelt lagt til <b>{add}</b> {add <= 1 ? "rute" : "ruter"}
      </span>
    );
  {
    !!add && !!remove && " og ";
  }
  if (remove > 0) {
    if (add > 0) r.push(" og ");
    r.push(
      <span key="rem">
        manuelt fjernet <b>{remove}</b> {remove <= 1 ? "rute" : "ruter"}
      </span>
    );
  }
  if (r.length <= 0) return null;
  return <span>, herav {r}</span>;
};

// Rogaland, Trøndelag, Vestfold
const beskrivFylker = artskartFylker => {
  if (artskartFylker.length <= 0) return "";
  const hasPresence = artskartFylker.filter(f => f.Status === 2);
  if (hasPresence.length <= 0) return "Ingen";
  return hasPresence
    .map(f => f.NAVN)
    .sort()
    .join(", ");
};

export default RedigerbartKart;

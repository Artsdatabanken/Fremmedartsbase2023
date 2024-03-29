import React from "react";
import { getArtskartUrl } from "../../apiService";
import useRestApi from "./useRestApi";

const csvToLatlng = s => {
  const r = [];
  if (!s) return r;
  const elements = s.split(",");
  for (let i = 0; i < elements.length; i += 2)
    r.push([elements[i], elements[i + 1]]);
  return r;
};

const artskartStringToFeatures = (csvPoints, source) => {
  return csvToLatlng(csvPoints).map(coords => {
    return { 
      type: "Feature",
      source,
      geometry: {
      coordinates: coords,
      type: "Point",
      }
    }
  })
}

const makeFeatures = (added, removed) => {
  // console.log('makeFeatures', added, removed);
  let features = [
    ...artskartStringToFeatures(added, 'add'),
    ...artskartStringToFeatures(removed, 'remove')
  ];
  return features;
};

// Artskart API hook
// https://artsdatabanken.no/Pages/195884
const useArtskart = ({
  taxonId,
  scientificNameId,
  kriterier,
  selectionGeometry,
  artskartAdded,
  artskartRemoved,
  showWaterAreas,
  artskartModel,
  artskartWaterModel,
}) => {
  const [observations, setObservations] = React.useState({
    features: makeFeatures(artskartAdded, artskartRemoved)
  });
  const [areadata, setAreadata] = React.useState({});
  const [countylist, setCountylist] = React.useState([]);
  const urls = getArtskartUrl(
    taxonId,
    scientificNameId,
    selectionGeometry,
    kriterier,
    artskartModel,
    showWaterAreas,
    observations,
  );
  const globalIds = artskartWaterModel && artskartWaterModel.areas
    ?
      artskartWaterModel.areas.filter(x => x.selected === 1).map(x => x.globalId)
    : undefined;
  const [status1] = useRestApi(urls.observations, globalIds, setObservations);
  const [status2] = useRestApi(urls.areadata, globalIds, setAreadata);
  let status3;
  if (urls.countylist) {
    const [countyStatus] = useRestApi(urls.countylist, undefined, setCountylist);
    status3 = countyStatus;
  }
  const status = Object.assign({}, status1, status2, status3);

  // console.log('useArtskart', kriterier);

  const handleAddPoint = e => {
    let { lng, lat } = e.latlng;

    // Find 2x2km grid:
    const eastAdd = 200000;
    const eastSub = 199000;
    
    lng = parseInt((lng + eastAdd) / 2000) * 2000 - eastSub
    lat = parseInt((lat) / 2000) * 2000 + 1000;

    const point = {
      geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      type: "Feature",
      source: "add"
    };
    const features = observations.features;
    features.push(point);
    // Add the users click immediately for user feedback
    // But then get an update from the server (because 2x2 squares, rect will move slightly)
    setObservations({ features });
  };

  // const isVeryCloseByGeographic = (d1, d2) => Math.abs(d1 - d2) < 1e-5;
  const isVeryCloseBy = (d1, d2) => Math.abs(d1 - d2) < 1000;

  const handleClickPoint = latlng => {
    // console.log('handleClickPoint pre - count', observations, observations.features.length, latlng);
    
    let orgFeature = false;
    const newFeatures = observations.features.filter(f => {
      if (f.geometry.type !== "Point") return true;
      const coords = f.geometry.coordinates;
      if (!isVeryCloseBy(coords[0], latlng.lng)) return true;
      if (!isVeryCloseBy(coords[1], latlng.lat)) return true;
      if (f.source === "add") return false;
      if (f.source === "remove") {
        f.source = "org";
        orgFeature = true;
        return true;
      }
      if (f.source === "org") f.source = "remove";
      return true;
    });
    if (newFeatures.length == observations.features.length && !orgFeature) {
      newFeatures.push({
        geometry: {
          type: "Point",
          coordinates: [latlng.lng, latlng.lat]
        },
        type: "Feature",
        source: "remove",
      });
    }
    // console.log('handleClickPoint post - count', newFeatures, newFeatures.length, latlng);
    // setObservations({ features: newFeatures });
    observations.features = newFeatures;
    const features = observations.features;
    setObservations({ features });
  };
  return [
    status,
    observations,
    areadata,
    countylist,
    handleAddPoint,
    handleClickPoint
  ];
};

export default useArtskart;

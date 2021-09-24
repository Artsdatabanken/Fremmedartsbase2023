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
  artskartRemoved
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
    observations
  );
  const [status1] = useRestApi(urls.observations, setObservations);
  const [status2] = useRestApi(urls.areadata, setAreadata);
  const [status3] = useRestApi(urls.countylist, setCountylist);
  const status = Object.assign({}, status1, status2, status3);

  // console.log('useArtskart', observations);

  const handleAddPoint = e => {
    let { lng, lat } = e.latlng;

    // Find 2x2km grid:
    const eastAdd = 200000;
    const eastSub = 199000;
    
    lng = parseInt((lng + eastAdd) / 2000) * 2000 - eastSub
    lat = parseInt((lat) / 2000) * 2000 + 1000;
    console.log('handleAddPoint ', observations, observations.features.length, e.latlng, {lng, lat});

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
  // const isVeryCloseBy = (d1, d2) => {
  //   console.log('isVeryCloseBy', d1, d2, Math.abs(d1 - d2), Math.abs(d1 - d2) < 1000);
  //   Math.abs(d1 - d2) < 1000;
  // };

  const handleClickPoint = latlng => {
    console.log('handleClickPoint pre - count', observations, observations.features.length, latlng);
    
    const newFeatures = observations.features.filter((f) => {
      console.log('handleClickPoint - feature', f);
      if (f.geometry.type !== "Point") return true;
      const coords = f.geometry.coordinates;
      if (!isVeryCloseBy(coords[0], latlng.lng)) return true;
      // console.log('remove feature (lng)', f);
      if (!isVeryCloseBy(coords[1], latlng.lat)) return true;
      // console.log('remove feature (lat)', f);
      if (f.source === "add") {
        console.log('remove feature', f);
        f.source = "remove";
        return false;
      }
      console.log('??', f.source);
      if (f.source === "remove") {
        f.source = "org";
        return true;
      }
      if (f.source === "org") f.source = "remove";
      return true;
    });
    console.log('handleClickPoint post - count', observations.features.length, latlng);
    setObservations({ features: newFeatures });
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

import auth from '../authService'
import config from '../../config';

let waterAreas = undefined;

export async function getWaterAreas() {
  if (waterAreas) return waterAreas;

  const waterObject = {
    waterArea: undefined,
    waterRegion: undefined
  };
  async function getResponse(layerid) {
    let url = `${config.apiUrl}/api/static/`;
    if (layerid === 14) url += 'WaterRegion';
    else if (layerid === 15) url += 'WaterArea';
    const response = await fetch(url, {
      method: 'get',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth.getAuthToken
      }
    });
    const data = await response.json();
    if (data.error) return;
    if (typeof data === 'string') return JSON.parse(data);
    return data;
  };

  waterObject.waterArea = await getResponse(15);
  waterObject.waterRegion = await getResponse(14);

  // waterObject.areaObject = waterObject.waterArea.features.map(x => x.properties);
  // waterObject.regionObject = waterObject.waterRegion.features.map(x => x.properties);
  waterObject.areaState = waterObject.waterArea.features.reduce((acc, x) => {
    acc[x.properties.globalID] = {
      name: x.properties.vannomraadenavn,
      // globalID: x.properties.globalID,
      vannregionID: x.properties.vannregionID,
      disabled: 1,
      state0: 0,
      state1: 0,
      state2: 1,
      state3: 0,
      // properties: x.properties
    };
    return acc;
  }, {});
  waterObject.regionState = waterObject.waterRegion.features.reduce((acc, x) => {
    acc[x.properties.globalID] = {
      name: x.properties.vannregionnavn,
      // globalID: x.properties.globalID,
      vannregionID: x.properties.vannregionID,
      disabled: 1,
      state0: 0,
      state1: 0,
      state2: 1,
      state3: 0,
      // properties: x.properties
    };
    return acc;
  }, {});

  // console.log('waterObject', waterObject);
  waterAreas = waterObject;
  return waterAreas;
}
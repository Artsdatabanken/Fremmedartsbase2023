import React, { useState } from "react";
import 'ol/ol.css';
import styles from './KartOpenLayers.css';
import { Feature, Map, View } from 'ol';
import { defaults as defaultControls, MousePosition } from 'ol/control';
import { Draw, Snap } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { getTopLeft,getWidth } from 'ol/extent';
import { Point, Polygon } from "ol/geom";
import Projection from 'ol/proj/Projection';
import { addProjection } from 'ol/proj';
import { OSM, Vector as VectorSource, WMTS as WmtsSource } from 'ol/source';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import Proj4 from 'proj4';

const selectionDrawingOptions = {
  position: "bottomright",
  marker: false,
  rectangle: false,
  polyline: false,
  circle: false,
  circlemarker: false,
  marker: false,
  polygon: {
    allowIntersection: false,
    drawError: {
      color: "#af0000",
      message: "Området kan ikke ha kryssende linjer.." // Message that will show when intersect
    },
    showArea: false,
    shapeOptions: {
      clickable: false,
      color: "#0000ff",
      weight: 1,
      opacity: 0.7
    }
  },
  edit: {
    edit: false,
    remove: false
  }
};

let redrawEveryTime = 0;
let map = null;
let areaLayer = null;
let areaSource = null;
let markerLayer = null;
let markerSource = null;
let drawInteraction = null;
let snapInteraction = null;

const KartOpenLayers = ({
  children,
  onAddPoint,
  onEdit,
  style,
  mapBounds,
  geojson,
  onClickPoint,
  onClosed
}) => {
  const [isEditing, setIsEditing] = useState();
  const epsg = 'EPSG:25833';
  const numZoomLevels = 18;
  const initialZoom = 3.7;
  const extent = [-2500000.0, 3500000.0, 3045984.0, 9045984.0];
  let mouseoverfeature = null;

  // console.log(style, geojson);
  const transformCoordinate = (fromEpsg, toEpsg, coordinate) => {
    if (Array.isArray(coordinate) && typeof coordinate[0] !== 'number') {
      if(typeof coordinate[0] === 'string') {
        for (let i = 0; i < coordinate.length; ++i) {
          coordinate[i] = parseFloat(coordinate[i]);
        }
      } else {
        console.error('unknown coordinate', coordinate[0]);
      }
    }
    return Proj4(fromEpsg, toEpsg, coordinate);
  };
  
  const createStyle = (geojsonfeature) => {
    if (!geojsonfeature.category) {
      return undefined;
    }
    const style4feature = geojsonfeature.source === 'add' ? style[geojsonfeature.source] : style[geojsonfeature.category];
    // console.log(style4feature);
    const fill = new Fill({
      color: style4feature.fillColor,
      opacity: style4feature.fillOpacity
    });
    const stroke = new Stroke({
      color: style4feature.color,
      width: style4feature.weight
    });
    // if (geojsonfeature.geometry.type === 'Point'){
      return new Style({
        // opacity: style4feature.opacity,
        image: new Circle({
          fill: fill,
          radius: style4feature.radius,
          stroke: stroke
        }),
        fill: fill,
        stroke: stroke
      });
    // } else if (geojsonfeature.geometry.type === 'Polygon') {
    //   return new Style({
    //     opacity: style4feature.opacity,
    //     fill: fill,
    //     stroke: stroke
    //   });
    // }
  };

  const addInteraction = () => {
    drawInteraction = new Draw({
      source: markerSource,
      type: 'Point'
    });
    drawInteraction.on('change', (e) => {
      console.log('change drawInteraction');
    });
    drawInteraction.on('drawend', (e) => {
      console.log('drawend', e);
      const coordinate = e.feature.getGeometry().getCoordinates();
      const features = markerSource.getFeaturesAtCoordinate(coordinate);
      console.log('features', features);
      if (features.length > 0) {
        // features.forEach(feature => markerSource.removeFeature(feature));
        // drawInteraction.abortDrawing();
        removeMarker(coordinate);
      } else {
        createMarker(coordinate);
      }
    });
    // map.addInteraction(drawInteraction);
    snapInteraction = new Snap({
      // pixelTolerance: 3,
      source: markerSource
    });
    snapInteraction.on('propertychange', e => console.log('snap change', e));
    map.addInteraction(snapInteraction);
  };

  const createMarker = (coordinate) => {
    // return L.circleMarker(latlng).on("click", e => {
    //   L.DomEvent.stopPropagation(e);
    //   onClickPoint(latlng);
    // });
    if (mouseoverfeature) {
      const latlng = mouseoverfeature.get('latlng');
      onClickPoint({
        lng: latlng[0],
        lat: latlng[1]
      });
    } else {
      const latlng = Proj4(epsg, 'EPSG:4326', coordinate);
      console.log('createMarker()', latlng);
      onAddPoint({
        latlng:
        {
          lng: latlng[0],
          lat: latlng[1]
        }
      });
    }
  };
  const removeMarker = (coordinate) => {
    const latlng = Proj4(epsg, 'EPSG:4326', coordinate);
    console.log('removeMarker()', latlng);

    // return L.circleMarker(latlng).on("click", e => {
    //   L.DomEvent.stopPropagation(e);
    //   onClickPoint(latlng);
    // });
    onClickPoint({
      lng: latlng[0],
      lat: latlng[1]
    });
  };

  const wmtsTileGrid = (numZoomLevels,matrixSet,projection) => {
    let resolutions = new Array(numZoomLevels);
    let matrixIds = new Array(numZoomLevels);
    
    // console.log('wmtsTileGrid()', numZoomLevels, matrixSet, projection);
    let projectionExtent = projection.getExtent();

    let size = getWidth(projectionExtent) / 256;
    

    for (let z = 0; z < numZoomLevels; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = matrixSet + ':' + z;
    }

    let wmtsTileGrid = new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
    });

    return wmtsTileGrid;
  };

  const initializeMap = () => {
    if (Proj4.defs(epsg) === undefined){
      Proj4.defs(epsg, '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    }

    const projection = new Projection({
      code: epsg,
      extent: extent,
      units: 'm'
    });
    addProjection(projection);
  
    const mapExtent = [transformCoordinate('EPSG:4326', epsg, [mapBounds[0][1], mapBounds[0][0]]), transformCoordinate('EPSG:4326', epsg, [mapBounds[1][1], mapBounds[1][0]])].flat();
    // const mapExtent1 = [transformCoordinate('EPSG:4326', epsg, [mapBounds[0][1], mapBounds[0][0]]), transformCoordinate('EPSG:4326', epsg, [mapBounds[1][1], mapBounds[1][0]])].flat();
    // const mapExtent2 = [transformCoordinate('EPSG:4326', epsg, [mapBounds[1][1], mapBounds[1][0]]), transformCoordinate('EPSG:4326', epsg, [mapBounds[0][1], mapBounds[0][0]])].flat();
    // const mapExtent = [
    //   Math.min(mapExtent1[0], mapExtent2[0]),
    //   Math.min(mapExtent1[1], mapExtent2[1]),
    //   Math.max(mapExtent1[2], mapExtent2[2]),
    //   Math.max(mapExtent1[3], mapExtent2[3])
    // ];
    const center = [mapExtent[0] + (mapExtent[2] - mapExtent[0]) / 2, mapExtent[1] + (mapExtent[3] - mapExtent[1]) / 2];

    // console.log(mapExtent, center);
    const view = new View({
      // center: [270673.29, 7039762.80],
      center: center,
      projection: epsg,
      maxZoom: numZoomLevels,
      zoom: initialZoom
    });

    areaSource = new VectorSource({wrapX: false});
    areaLayer = new VectorLayer({source: areaSource});
    markerSource = new VectorSource({wrapX: false});
    markerLayer = new VectorLayer({source: markerSource});

    map = new Map({
      controls: defaultControls({attribution: false}),
      target: 'olmap',
      layers: [
        new TileLayer({
          name: 'Europakart',
          opacity: 1,
          extent: extent,
          source: new WmtsSource({
            url: '//opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
            // layer: 'europa',
            layer: 'europa_forenklet',
            attributions: 'Kartverket',
            matrixSet: epsg,
            format: 'image/png',
            projection: projection,
            tileGrid: wmtsTileGrid(numZoomLevels, epsg, projection),
            style: 'default',
            wrapX: true,
            crossOrigin: 'anonymous'
          }),
          visible: true
        }),
        new TileLayer({
          name: 'Norges grunnkart',
          opacity: 1,
          extent: extent,
          source: new WmtsSource({
            url: '//opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
            // layer: 'europa',
            layer: 'norges_grunnkart',
            attributions: 'Kartverket',
            matrixSet: epsg,
            format: 'image/png',
            projection: projection,
            tileGrid: wmtsTileGrid(numZoomLevels, epsg, projection),
            style: 'default',
            wrapX: true,
            crossOrigin: 'anonymous'
          }),
          visible: true
        }),
        areaLayer,
        markerLayer
      ],
      view: view
    });

    view.fit(mapExtent, {
      padding: [10, 10, 10, 10],
      nearest: false,
      size: map.getSize()
    });

    map.on('click', (e) => {
      const coordinate = map.getCoordinateFromPixel(e.pixel);
      console.log('click', coordinate, e.originalEvent);

      createMarker(coordinate);
    });

    map.on('pointermove', (e) => {
      const pixelOffset = 3;
      const max = map.getCoordinateFromPixel([e.pixel[0] + pixelOffset, e.pixel[1] - pixelOffset]);
      const min = map.getCoordinateFromPixel([e.pixel[0] - pixelOffset, e.pixel[1] + pixelOffset]);
      const extent = [min[0], min[1], max[0], max[1]];
      const features = markerSource.getFeaturesInExtent(extent);
      if (features && features.length > 0) {
        // console.log('pointermove', features);
        mouseoverfeature = features[0];
        document.getElementById('olmap').style.cursor = 'pointer';
      } else {
        mouseoverfeature = null;
        document.getElementById('olmap').style.cursor = 'crosshair';
      }
    });

    // addInteraction();

    console.log('created a map');
  };

  const element = document.getElementById('olmap');
  if (!element) {
    map = null;
    markerLayer = null;
    areaLayer = null;
    return null;
  }

  // console.log('KartOpenLayers', redrawEveryTime++, geojson);

  // if (redrawEveryTime > 1 && map === null){
  if (map === null){
    initializeMap();
  } else if (map) {
  //   let size = map.getSize();
  //   console.log('size', size);
    map.updateSize();
  }
  areaSource.clear();
  markerSource.clear();
  if (geojson && geojson.features) {
    geojson.features.forEach(geojsonfeature => {
      // console.log('feature', geojsonfeature);
      let geometry = null;
      const latlng = [...geojsonfeature.geometry.coordinates];
      // console.log(geojsonfeature.geometry.coordinates);
      if (geojsonfeature.geometry.type === 'Point') {
        const coordinate = transformCoordinate('EPSG:4326', epsg, geojsonfeature.geometry.coordinates);
        geometry = new Point(coordinate);
      } else if (geojsonfeature.geometry.type === 'Polygon') {
        const coordinates = [[]];
        geojsonfeature.geometry.coordinates[0].forEach(coordinate => {
          coordinates[0].push(transformCoordinate('EPSG:4326', epsg, coordinate));
        });
        geometry = new Polygon(coordinates);
        const polygonFeature = new Feature({
          geometry: geometry
        });
        const polygonStyle = createStyle(geojsonfeature);
        if (polygonStyle) {
          polygonFeature.setStyle(polygonStyle);
        }
        areaSource.addFeature(polygonFeature);
        geometry = null;
      } else {
        console.log('Unknown geometry', geojsonfeature.geometry.type);
      }
      if (geometry) {
        const pointFeature = new Feature({
          geometry: geometry
        });
        pointFeature.set('latlng', latlng);
        const pointStyle = createStyle(geojsonfeature);
        if (pointStyle) {
          pointFeature.setStyle(pointStyle);
        }
        markerSource.addFeature(pointFeature);
      }
    });
  }
  return null;
}

export default KartOpenLayers;

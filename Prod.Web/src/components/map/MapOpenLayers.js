import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import "ol/ol.css";
import styles from "./MapOpenLayers.css"; // don't delete. it's used to move buttons to the right side
import MapContext from "./MapContext";
import { intersect, multiPolygon as TurfMultiPolygon } from "@turf/turf";
import { Feature, Map, Overlay, View } from "ol";
import { Control, defaults as defaultControls } from "ol/control";
import { Draw } from "ol/interaction";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Point, Polygon } from "ol/geom";
import { GeoJSON as GeoJSONFormat } from "ol/format";
import Proj4 from "proj4";
import { addProjection, Projection } from "ol/proj";
import { Vector as VectorSource, WMTS as WmtsSource } from "ol/source";
import mapOlFunc from "./MapOlFunctions";
import config from "../../config";

const MapOpenLayers = ({
  showWaterAreas,
  artskartWaterModel,
  waterFeatures,
  onAddPoint,
  onEdit,
  style,
  mapBounds,
  geojson,
  selectionGeometry,
  onClickPoint,
  setWaterAreas,
  setIsLoading,
  isLoading,
  onClosed,
  token,
}) => {
  const mapRef = useRef();
  const [visibleLegend, setVisibleLegend] = useState(false);
  const [map, setMap] = useState(null);
  const [lastIsWaterArea, setLastIsWaterArea] = useState(
    artskartWaterModel ? artskartWaterModel.isWaterArea : undefined
  );
  const [waterLayerName, setWaterLayerName] = useState(undefined);
  const [pointerMoveTarget, setPointerMoveTarget] = useState(undefined);
  const waterFieldName =
    artskartWaterModel && artskartWaterModel.isWaterArea
      ? "vannomraadenavn"
      : "vannregionnavn";
  const mapZoom = 3.7;
  const assessmentArea =
    artskartWaterModel && artskartWaterModel.areas
      ? artskartWaterModel.areas
          .filter((x) => x.disabled === 0)
          .map((x) => x.globalId)
      : undefined;
  let mapObject;
  let mapCenter = [];
  let mouseoverfeature = null;
  let featureOver;
  let drawPolygonInteraction;
  let waterIntersections = {};

  //if (!mapBounds) mapBounds = [[57, 4.3], [71.5, 32.5]];

  // console.log('MapOpenLayers', geojson, selectionGeometry);

  const transformCoordinate = (fromEpsgCode, toEpsgCode, coordinate) => {
    if (fromEpsgCode === toEpsgCode) {
      // console.log('transformCoordinate unchanged', fromEpsgCode, toEpsgCode);
      return coordinate;
    }

    if (Array.isArray(coordinate) && typeof coordinate[0] !== "number") {
      if (typeof coordinate[0] === "string") {
        for (let i = 0; i < coordinate.length; ++i) {
          coordinate[i] = parseFloat(coordinate[i]);
        }
      } else {
        console.error("unknown coordinate", coordinate[0]);
      }
    }
    return Proj4(`EPSG:${fromEpsgCode}`, `EPSG:${toEpsgCode}`, coordinate);
  };

  const createMarker = (coordinate) => {
    if (mouseoverfeature) {
      // console.log('mouseover', mouseoverfeature.getProperties());
      const latlng = mouseoverfeature.get("latlng");
      removeMarker(latlng);
    } else {
      // console.log('createMarker()', coordinate);
      onAddPoint({
        latlng: {
          lng: coordinate[0],
          lat: coordinate[1],
        },
      });
    }
  };
  const removeMarker = (coordinate) => {
    onClickPoint({
      lng: coordinate[0],
      lat: coordinate[1],
    });
  };

  const calculateWaterIntersection = (mapObject, fieldName) => {
    if (!showWaterAreas) {
      setIsLoading(false);
      return;
    }
    setWaterAreas();
    setIsLoading(true);
    waterIntersections = {};
    const layers = mapObject.getLayers().getArray();
    // const areaLayer = layers.filter((layer) => layer.get('name') === 'areaLayer' ? true : false)[0];
    const markerLayer = layers.filter((layer) =>
      layer.get("name") === "markerLayer" ? true : false
    )[0];
    const waterLayer = layers.filter(
      (layer) => layer.get("name") === "Vatn"
    )[0];
    const waterSelectedLayer = layers.filter(
      (layer) => layer.get("name") === "VatnSelected"
    )[0];
    if (!markerLayer || !waterLayer || !waterSelectedLayer) {
      setIsLoading(false);
      return;
    }

    waterSelectedLayer.getSource().clear();

    const features = markerLayer
      .getSource()
      .getFeatures()
      .filter(
        (f) =>
          f.getProperties().properties &&
          f.getProperties().properties.category &&
          f.getProperties().properties.category === "inside"
      );
    if (features.length === 0) {
      setIsLoading(false);
      return;
    }

    const waterFeatures = waterLayer.getSource().getFeatures();
    if (waterFeatures.length === 0) {
      setIsLoading(false);
      return;
    }

    const createTurfPoint = (feature) => {
      const coordinate = feature.getGeometry().getCoordinates();
      const coordinates = [
        [
          [coordinate[0], coordinate[1]],
          [coordinate[0] + 0.1, coordinate[1]],
          [coordinate[0] + 0.1, coordinate[1] + 0.1],
          [coordinate[0], coordinate[1] + 0.1],
          [coordinate[0], coordinate[1]],
        ],
      ];
      return new TurfMultiPolygon(coordinates, feature.getProperties());
      // return new TurfPoint(feature.getGeometry().getCoordinates(), feature.getProperties());
    };
    const createTurfMultiPolygon = (feature) => {
      return new TurfMultiPolygon(
        feature.getGeometry().getCoordinates(),
        feature.getProperties()
      );
    };

    const theFeatures = features.map((f) => createTurfPoint(f));
    const theWaterFeatures = waterFeatures.map((f) =>
      createTurfMultiPolygon(f)
    );

    // console.log('calculate intersections..');
    const waterIntersectionFeatures = [];
    theFeatures.forEach((theFeature) => {
      // console.log('featurecoord', theFeature.getGeometry().getCoordinates());
      theWaterFeatures.forEach((theWaterFeature, j) => {
        if (waterFeatures[j].get("disabled") === false) {
          const featureName = waterFeatures[j].get(fieldName);
          // console.log('intersect', featureName, waterFeatures[j].get('disabled'));
          if (
            !waterIntersections.hasOwnProperty(featureName) ||
            (waterIntersections.hasOwnProperty(featureName) &&
              !waterIntersections[featureName].intersects)
          ) {
            const intersects = intersect(theWaterFeature, theFeature);
            // console.log('theWaterFeature.properties', theWaterFeature.properties);
            waterIntersections[featureName] = {
              name: featureName,
              isWaterArea: lastIsWaterArea,
              intersects: intersects !== null,
              globalId: theWaterFeature.properties["globalID"],
            };
            if (intersects !== null)
              waterIntersectionFeatures.push(waterFeatures[j]);
          }
        }
      });
    });

    setWaterAreas(Object.values(waterIntersections));

    waterSelectedLayer.getSource().addFeatures(waterIntersectionFeatures);
    setIsLoading(false);
  };

  const setPointerMoveForWaterLayer = (mapObject, fieldName) => {
    if (!mapObject) return;

    const hoverLayer = mapObject
      .getLayers()
      .getArray()
      .filter((layer) => layer.get("name") === "hoverLayer")[0];

    const pointermove = (e) => {
      if (isLoading) return;
      // console.log(`${e.pixel[0]},${e.pixel[1]}`); // check if pointermove is called multiple times
      const layerName = "Vatn";
      const vatnLayer = mapObject
        .getLayers()
        .getArray()
        .filter((layer) => (layer.get("name") === layerName ? true : false))[0];
      if (!vatnLayer) return;
      const vatnSource = vatnLayer.getSource();
      if (!vatnSource) return;

      const vatn = [];
      mapObject.forEachFeatureAtPixel(e.pixel, (f) => {
        const featureLayerName = f.get("_layerName");
        if (featureLayerName && featureLayerName === layerName) {
          vatn.push(f);
          return true;
        }
        return false;
      });

      const hoverSource = hoverLayer.getSource();
      if (vatn && vatn.length > 0) {
        const name = vatn[0].get(fieldName);
        if (featureOver && featureOver.get(fieldName) === name) return;
        if (featureOver) hoverSource.clear();

        featureOver = vatn[0];
        mapOlFunc.vectorFeatures[layerName]
          .filter((feature) => feature.get(fieldName) === name)
          .forEach((sourceFeature) => {
            hoverSource.addFeature(sourceFeature);
          });
        // setWaterAreas(name);
      } else if (
        mapOlFunc.vectorFeatures[layerName] &&
        mapOlFunc.vectorFeatures[layerName].length > 0
      ) {
        featureOver = undefined;
        hoverSource.clear();
        // setWaterAreas();
      }
    };

    if (pointerMoveTarget && pointerMoveTarget.listener) {
      mapObject.un("pointermove", pointerMoveTarget.listener);
    }

    calculateWaterIntersection(mapObject, fieldName);

    setPointerMoveTarget(mapObject.on("pointermove", pointermove));
  };

  const cancelDrawPolygon = () => {
    if (!mapObject) return;
    // console.log('remove interaction');
    mapObject.removeInteraction(drawPolygonInteraction);
    drawPolygonInteraction = null;
  };

  const drawPolygon = () => {
    if (!mapObject) return;
    if (drawPolygonInteraction) {
      // console.log('remove drawPolygonInteraction');
      cancelDrawPolygon();
      return;
    }
    // console.log('add drawPolygonInteraction');
    const markerLayer = mapObject
      .getLayers()
      .getArray()
      .filter((layer) =>
        layer.get("name") === "markerLayer" ? true : false
      )[0];
    if (!markerLayer) return;
    const markerSource = markerLayer.getSource();
    if (!markerSource) return;

    drawPolygonInteraction = new Draw({
      source: markerSource,
      type: "Polygon",
    });
    // drawPolygonInteraction.on('change', (e) => {
    //     console.log('change drawPolygonInteraction');
    // });
    drawPolygonInteraction.on("drawend", (e) => {
      // console.log('drawend', e.feature);
      // const polygon = (new GeoJSONFormat()).writeFeature(e.feature);
      // console.log('polygon', polygon);
      setTimeout(() => {
        cancelDrawPolygon();
        onEdit(new GeoJSONFormat().writeFeature(e.feature));
      }, 0);
    });
    mapObject.addInteraction(drawPolygonInteraction);
  };

  useLayoutEffect(() => {
    if (!showWaterAreas) return;
    if (map === null) return;
    if (
      lastIsWaterArea === undefined ||
      lastIsWaterArea ===
        (artskartWaterModel ? artskartWaterModel.isWaterArea : undefined)
    )
      return;

    // reDrawWaterLayer();
    setWaterAreas();
    setIsLoading(true);
    const waterSelectedLayer = map
      .getLayers()
      .getArray()
      .filter((layer) => layer.get("name") === "VatnSelected")[0];
    if (waterSelectedLayer) waterSelectedLayer.getSource().clear();
    mapOlFunc.reDrawWaterLayer(
      map,
      0,
      undefined,
      waterFeatures,
      setLastIsWaterArea,
      setPointerMoveForWaterLayer,
      setWaterLayerName
    );
  });

  // on component mount
  useEffect(() => {
    const mapControls = [];
    const customElement = document.createElement("div");
    customElement.className = "ol-legend ol-unselectable ol-control";

    // customElement.appendChild(mapOlFunc.createButton({
    //     click: toggleLegend,
    //     innerHTML: '&vert;&vert;&vert;',
    //     style: 'transform: rotate(90deg);'
    // }));

    customElement.appendChild(
      mapOlFunc.createButton({
        click: drawPolygon,
        innerHTML:
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="22" height="22" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><path d="M14 4c-1.105 0-2 .895-2 2v.063L6.937 9.25A2.009 2.009 0 0 0 6 9c-1.105 0-2 .895-2 2c0 .738.402 1.371 1 1.719V24.28c-.598.348-1 .98-1 1.719c0 1.105.895 2 2 2c.738 0 1.371-.402 1.719-1H20.28c.348.598.98 1 1.719 1c1.105 0 2-.895 2-2c0-.398-.11-.781-.313-1.094L26.125 20a2.005 2.005 0 0 0 .25-3.969l-1.906-5.718C24.785 9.957 25 9.511 25 9c0-1.105-.895-2-2-2c-.512 0-.957.215-1.313.531L15.97 5.594A2.012 2.012 0 0 0 14 4zm1.313 3.5l5.718 1.875c.153.805.79 1.441 1.594 1.594l1.906 5.687A1.99 1.99 0 0 0 24 18c0 .414.129.805.344 1.125L21.875 24a1.988 1.988 0 0 0-1.594 1H7.72A1.981 1.981 0 0 0 7 24.281V12.72c.598-.348 1-.98 1-1.719v-.063l5.063-3.187c.28.148.597.25.937.25c.504 0 .96-.191 1.313-.5z" fill="currentColor"/></svg>',
      })
    );

    mapControls.push(new Control({ element: customElement }));

    if (Proj4.defs(`EPSG:${config.mapEpsgCode}`) === undefined) {
      Proj4.defs(`EPSG:${config.mapEpsgCode}`, config.mapEpsgDef);
    }
    const projection = new Projection({
      code: `EPSG:${config.mapEpsgCode}`,
      extent: mapOlFunc.extent,
      units: "m",
    });
    addProjection(projection);

    const mapExtent = [
      transformCoordinate(4326, config.mapEpsgCode, [
        mapBounds[0][1],
        mapBounds[0][0],
      ]),
      transformCoordinate(4326, config.mapEpsgCode, [
        mapBounds[1][1],
        mapBounds[1][0],
      ]),
    ].flat();
    mapCenter = [
      mapExtent[0] + (mapExtent[2] - mapExtent[0]) / 2,
      mapExtent[1] + (mapExtent[3] - mapExtent[1]) / 2,
    ];
    const hoverLayer = new VectorLayer({
      name: "hoverLayer",
      source: new VectorSource({ wrapX: false, _text: false }),
      style: (feature, resolution) =>
        mapOlFunc.hoverStyleFunction(feature, resolution, 0),
      zIndex: 3,
    });
    const areaLayer = new VectorLayer({
      name: "areaLayer",
      source: new VectorSource({ wrapX: false }),
      zIndex: 5,
    });
    const markerLayer = new VectorLayer({
      name: "markerLayer",
      source: new VectorSource({ wrapX: false }),
      zIndex: 6,
    });
    let options = {
      view: new View({
        center: mapCenter,
        projection: `EPSG:${config.mapEpsgCode}`,
        maxZoom: mapOlFunc.numZoomLevels,
        zoom: 0, // mapZoom
      }),
      layers: [
        new TileLayer({
          name: "Europakart",
          opacity: 1,
          extent: mapOlFunc.extent,
          source: new WmtsSource({
            url:
              "//gatekeeper3.geonorge.no/BaatGatekeeper/gk/gk.cache_wmts?gkt=" +
              token,
            // layer: 'europa',
            layer: "europa_forenklet",
            attributions: "Kartverket",
            matrixSet: `EPSG:${config.mapEpsgCode}`,
            format: "image/png",
            projection: projection,
            tileGrid: mapOlFunc.wmtsTileGrid(
              mapOlFunc.numZoomLevels,
              `EPSG:${config.mapEpsgCode}`,
              projection
            ),
            style: "default",
            wrapX: true,
            crossOrigin: "anonymous",
          }),
          visible: true,
          zIndex: 0,
        }),
        new TileLayer({
          name: "Norges grunnkart",
          opacity: 1,
          extent: mapOlFunc.extent,
          source: new WmtsSource({
            url:
              "//gatekeeper3.geonorge.no/BaatGatekeeper/gk/gk.cache_wmts?gkt=" +
              token,
            // layer: 'europa',
            layer: "norges_grunnkart",
            attributions: "Kartverket",
            matrixSet: `EPSG:${config.mapEpsgCode}`,
            format: "image/png",
            projection: projection,
            tileGrid: mapOlFunc.wmtsTileGrid(
              mapOlFunc.numZoomLevels,
              `EPSG:${config.mapEpsgCode}`,
              projection
            ),
            style: "default",
            wrapX: true,
            crossOrigin: "anonymous",
          }),
          visible: true,
          zIndex: 1,
        }),
      ],
      controls: defaultControls({ attribution: false }).extend(mapControls),
      overlays: [
        new Overlay({
          id: "overlay",
          element: mapOlFunc.createPopupElement(true, 0),
        }),
      ],
    };

    options.layers.push(hoverLayer);
    options.layers.push(areaLayer);
    options.layers.push(markerLayer);

    mapObject = new Map(options);

    mapObject.setTarget(mapRef.current);
    setMap(mapObject);
    // console.log('map initialize', mapObject.getTarget());

    // mapObject.updateSize();

    mapObject.on("click", (e) => {
      if (drawPolygonInteraction) return;
      const coordinate = mapObject.getCoordinateFromPixel(e.pixel);
      // console.log('click', geojson, coordinate, e);
      // e.preventDefault();
      // e.originalEvent.preventDefault();
      e.stopPropagation();
      // e.originalEvent.stopPropagation();

      // setTimeout(() => {
      createMarker(coordinate);
      // }, 500);
    });

    const overlay = mapObject.getOverlayById("overlay");
    if (!overlay.getElement()) {
      const elements = document.getElementsByClassName(
        `ol-popup ol-popup-${0}`
      );
      if (elements.length === 1) {
        overlay.setElement(elements[0]);
      } else {
        overlay.setElement(mapOlFunc.createPopupElement(true, 0));
      }
    }

    mapObject.on("pointermove", (e) => {
      if (drawPolygonInteraction) return;

      const content = document.getElementsByClassName(
        `ol-popup-content ol-popup-content-${0}`
      )[0];
      content.innerHTML = "";

      const markerLayer = mapObject
        .getLayers()
        .getArray()
        .filter((layer) =>
          layer.get("name") === "markerLayer" ? true : false
        )[0];
      if (!markerLayer) return;
      const markerSource = markerLayer.getSource();
      if (!markerSource) return;

      const pixelOffset = 3;
      const max = mapObject.getCoordinateFromPixel([
        e.pixel[0] + pixelOffset,
        e.pixel[1] - pixelOffset,
      ]);
      const min = mapObject.getCoordinateFromPixel([
        e.pixel[0] - pixelOffset,
        e.pixel[1] + pixelOffset,
      ]);
      const extent = [min[0], min[1], max[0], max[1]];
      const features = markerSource.getFeaturesInExtent(extent);
      if (features && features.length > 0) {
        // console.log('pointermove', features);
        mouseoverfeature = features[0];
        mapObject.getTargetElement().style.cursor = "pointer";
      } else {
        mouseoverfeature = null;
        mapObject.getTargetElement().style.cursor = "crosshair";
      }
      mapObject.forEachFeatureAtPixel(e.pixel, (f) => {
        const featureLayerName = f.get("_layerName");
        if (featureLayerName && featureLayerName === "Vatn") {
          if (content) {
            // Show name with faded font if feature is disabled
            let waterClassname =
              f.get("disabled") === true
                ? " class='ol-popup-feature-disabled'"
                : "";
            content.innerHTML = `<p${waterClassname}>${f.get(
              waterFieldName
            )}</p>`;
            overlay.getElement().style.opacity = 1;
            overlay.setPosition(e.coordinate);
          }
          return true;
        }
        return false;
      });

      if (content.innerHTML.length === 0) {
        overlay.getElement().style.opacity = 0;
      }
    });

    if (showWaterAreas) {
      // 0: Kommune (0)
      // 1: REGINE (1)
      // 2: Vannområde (2)
      // 3: Vannregion (3)
      // 4: Vannregionmyndighet (4)
      // 5: Vassdragsområde (5)
      // 6: Økoregion kyst (6)
      // 7: Økoregion fastland (7)
      // 8: Klimasone (8)
      // 9: Fylke (9)

      const setWaterLayerNameCallback = (name) => {
        setWaterLayerName(name);
        setPointerMoveForWaterLayer(mapObject, name);
      };

      // nve.geodataonline.no has new layers
      // layerid = 14; // Vannregion
      // layerid = 15; // Vannomraade

      setLastIsWaterArea(artskartWaterModel.isWaterArea);

      mapObject.addLayer(
        mapOlFunc.createWaterLayer(
          "Vatn",
          0,
          artskartWaterModel,
          waterFeatures,
          projection,
          undefined,
          assessmentArea,
          setWaterLayerNameCallback
        )
      );
      mapOlFunc
        .createWaterSelectedLayer("VatnSelected", projection)
        .then((l) => {
          mapObject.addLayer(l);
        });
    }

    // Fit extent
    mapObject.getView().fit(mapExtent);

    return () => mapObject.setTarget(undefined);
  }, []);

  const drawUtbredelse = () => {
    if (!map) return;

    const layers = map.getLayers().getArray();
    const areaLayer = layers.filter((layer) =>
      layer.get("name") === "areaLayer" ? true : false
    )[0];
    const markerLayer = layers.filter((layer) =>
      layer.get("name") === "markerLayer" ? true : false
    )[0];

    if (!areaLayer || !markerLayer) return;

    const areaSource = areaLayer.getSource();
    const markerSource = markerLayer.getSource();
    // console.log('MapOpenLayers - drawing...', areaSource);

    if (!areaSource || !markerSource) return;

    areaSource.clear();
    markerSource.clear();

    if (geojson && geojson.features && geojson.features.length > 0) {
      let geojsonCrsCode = 4326;
      if (geojson.crs) {
        let geojsonCrsMatch = geojson.crs.properties.name.match(/\d+/);
        if (geojsonCrsMatch) {
          geojsonCrsCode = parseInt(geojsonCrsMatch[0]);
        }
      }
      // console.log('geojsonCrs', geojsonCrsCode);
      geojson.features.forEach((geojsonfeature) => {
        // console.log('feature', geojsonfeature);
        let geometry = null;
        const latlng = [...geojsonfeature.geometry.coordinates];
        // console.log(geojsonfeature.geometry.coordinates);
        if (geojsonfeature.geometry.type === "Point") {
          const coordinate = transformCoordinate(
            geojsonCrsCode,
            config.mapEpsgCode,
            geojsonfeature.geometry.coordinates
          );
          geometry = new Point(coordinate);
        } else if (geojsonfeature.geometry.type === "Polygon") {
          if (assessmentArea === undefined) {
            const coordinates = [[]];
            geojsonfeature.geometry.coordinates[0].forEach((coordinate) => {
              coordinates[0].push(
                transformCoordinate(
                  geojsonCrsCode,
                  config.mapEpsgCode,
                  coordinate
                )
              );
            });
            geometry = new Polygon(coordinates);
            const polygonFeature = new Feature({
              geometry: geometry,
            });
            const polygonStyle = mapOlFunc.createStyle(geojsonfeature, style);
            if (polygonStyle) {
              polygonFeature.setStyle(polygonStyle);
            }
            // areaSource.addFeature(polygonFeature);
            geometry = null;
          }
        } else {
          console.log("Unknown geometry", geojsonfeature.geometry.type);
        }
        if (geometry) {
          const pointFeature = new Feature({
            geometry: geometry,
            properties: {
              category: geojsonfeature.category,
              source: geojsonfeature.source,
            },
          });
          pointFeature.set("latlng", latlng);
          const pointStyle = mapOlFunc.createStyle(geojsonfeature, style);
          if (pointStyle) {
            pointFeature.setStyle(pointStyle);
          }
          markerSource.addFeature(pointFeature);
        }
      });
      calculateWaterIntersection(map, waterLayerName);
      // console.log('summary', areaSource.getFeatures(), markerSource.getFeatures());
    }
    if (selectionGeometry) {
      // console.log('selectionGeometry', selectionGeometry);
      const selectionFeature = new GeoJSONFormat().readFeature(
        selectionGeometry
      );
      // console.log(selectionFeature);
      areaSource.addFeature(selectionFeature);
    }
  };

  useEffect(drawUtbredelse, [geojson]);

  return (
    <div>
      <div>{visibleLegend && <span>{"tegnforklaring"}</span>}</div>
      <MapContext.Provider value={{ map }}>
        <div
          ref={mapRef}
          className="ol-map"
          style={{ cursor: "crosshair" }}
        ></div>
      </MapContext.Provider>
    </div>
  );
};

export default MapOpenLayers;

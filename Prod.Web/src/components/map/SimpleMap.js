import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import 'ol/ol.css';
import styles from './MapOpenLayers.css'; // don't delete. it's used to move buttons to the right side
import { Collection, Feature, Map, View } from 'ol';
import { Control, defaults as defaultControls } from 'ol/control';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, WMTS as WmtsSource } from 'ol/source';
import Proj4 from 'proj4';
import { addProjection, Projection } from 'ol/proj';
import { DragBox, Select } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import MapContext from "./MapContext";
import mapOlFunc from './MapOlFunctions';
import config from '../../config';
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

const SimpleMap = ({
    evaluationContext,
    onClick,
    showRegion,
    selectAll,
    modal,
    static,
    mapType
}) => {
    const mapRef = useRef();
	const [map, setMap] = useState(null);
    const [pointerMoveTarget, setPointerMoveTarget] = useState(undefined);
    let mapObject;
    let mapCenter = [];
    let featureOver;
    const waterFieldName = showRegion ? 'vannregionnavn' : 'vannomraadenavn';

    const transformCoordinate = (fromEpsgCode, toEpsgCode, coordinate) => {
        if (fromEpsgCode === toEpsgCode) {
            // console.log('transformCoordinate unchanged', fromEpsgCode, toEpsgCode);
            return coordinate;
        }
    
        if (Array.isArray(coordinate) && typeof coordinate[0] !== 'number') {
            if(typeof coordinate[0] === 'string') {
                for (let i = 0; i < coordinate.length; ++i) {
                coordinate[i] = parseFloat(coordinate[i]);
                }
            } else {
                console.error('unknown coordinate', coordinate[0]);
            }
        }
        return Proj4(`EPSG:${fromEpsgCode}`, `EPSG:${toEpsgCode}`, coordinate);
    }

    const setPointerMove = (mapObject) => {

        const pointermove = (e) => {
            const vatnLayer = mapObject.getLayers().getArray().filter((layer) => layer.get('name') === 'Vatn' ? true : false)[0];
            if (!vatnLayer) return;
            const vatnSource = vatnLayer.getSource();
            if (!vatnSource) return;

            const hoverLayer = mapObject.getLayers().getArray().filter(layer => layer.get('name') === 'hoverLayer')[0];

            const vatn = [];
            mapObject.forEachFeatureAtPixel(e.pixel, (f) => {
                const featureLayerName = f.get('_layerName');
                // console.log('feature', featureLayerName, f);
                if (featureLayerName && featureLayerName === 'Vatn') {
                    vatn.push(f);
                    return true;
                }
                return false;
            });
            // console.log('pointermove', waterFieldName, vatn);
            const hoverSource = hoverLayer.getSource();
            if (vatn && vatn.length > 0) {
                const name = vatn[0].get(waterFieldName);
                // if (featureOver && featureOver.get(waterFieldName) === name) return;
                if (featureOver) hoverSource.clear();

                featureOver = vatn[0];
                hoverSource.addFeatures(vatn);
            } else {
                featureOver = undefined;
                hoverSource.clear();
            }
        };

        if (pointerMoveTarget && pointerMoveTarget.listener) {
            mapObject.un('pointermove', pointerMoveTarget.listener);
        }

        setPointerMoveTarget(mapObject.on('pointermove', pointermove));

    }

    useEffect(() => {
        if (!map) return;

        const vatnLayer = map.getLayers().getArray().filter((layer) => layer.get('name') === 'Vatn' ? true : false)[0];
        if (!vatnLayer) return;
        const layers = map.getLayers().getArray();
        const waterSelectedLayer = layers.filter(layer => layer.get('name') === 'VatnSelected')[0];
        
        let features = [];
        waterSelectedLayer.getSource().clear();
        if (selectAll) {
            features = vatnLayer.getSource().getFeatures();
            waterSelectedLayer.getSource().addFeatures(features);
        }

        console.log('selectAll changed', selectAll, features);
    }, [selectAll]);

	useEffect(() => {

        // console.log('SimpleMap - useEffect', showRegion);

        if (Proj4.defs(`EPSG:${config.mapEpsgCode}`) === undefined) {
            Proj4.defs(`EPSG:${config.mapEpsgCode}`, config.mapEpsgDef);
        }
        const projection = new Projection({
            code: `EPSG:${config.mapEpsgCode}`,
            extent: mapOlFunc.extent,
            units: 'm'
        });
        addProjection(projection);

        const mapExtent = [transformCoordinate(4326, config.mapEpsgCode, [mapBounds[evaluationContext][0][1], mapBounds[evaluationContext][0][0]]), transformCoordinate(4326, config.mapEpsgCode, [mapBounds[evaluationContext][1][1], mapBounds[evaluationContext][1][0]])].flat();
        mapCenter = [mapExtent[0] + (mapExtent[2] - mapExtent[0]) / 2, mapExtent[1] + (mapExtent[3] - mapExtent[1]) / 2];

        const options = {
            view: new View({
                center: mapCenter,
                projection: `EPSG:${config.mapEpsgCode}`,
                maxZoom: mapOlFunc.numZoomLevels,
                zoom: 0
            }),
            layers: [],
            controls: defaultControls({attribution: false, zoom: !static})
        };
        if (static) {
            options.interactions = new Collection();
        } else {
            options.layers.push(new TileLayer({
                name: 'Europakart',
                opacity: 1,
                extent: mapOlFunc.extent,
                source: new WmtsSource({
                    url: '//opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
                    // layer: 'europa',
                    layer: 'europa_forenklet',
                    attributions: 'Kartverket',
                    matrixSet: `EPSG:${config.mapEpsgCode}`,
                    format: 'image/png',
                    projection: projection,
                    tileGrid: mapOlFunc.wmtsTileGrid(mapOlFunc.numZoomLevels, `EPSG:${config.mapEpsgCode}`, projection),
                    style: 'default',
                    wrapX: true,
                    crossOrigin: 'anonymous'
                }),
                visible: true,
                zIndex: 0
            }));
            options.layers.push(new TileLayer({
                name: 'Norges grunnkart',
                opacity: 1,
                extent: mapOlFunc.extent,
                source: new WmtsSource({
                    url: '//opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
                    // layer: 'europa',
                    layer: 'norges_grunnkart',
                    attributions: 'Kartverket',
                    matrixSet: `EPSG:${config.mapEpsgCode}`,
                    format: 'image/png',
                    projection: projection,
                    tileGrid: mapOlFunc.wmtsTileGrid(mapOlFunc.numZoomLevels, `EPSG:${config.mapEpsgCode}`, projection),
                    style: 'default',
                    wrapX: true,
                    crossOrigin: 'anonymous'
                }),
                visible: true,
                zIndex: 1
            }));
            options.layers.push(mapOlFunc.createWaterSelectedLayer('VatnSelected', projection));
        }
        options.layers.push(mapOlFunc.createWaterLayer('Vatn', showRegion ? 14 : 15, projection, '', () => {}));
        options.layers.push(new VectorLayer({
            name: 'hoverLayer',
            source: new VectorSource({wrapX: false, _text: false}),
            style: mapOlFunc.hoverStyleFunction,
            zIndex: 3
        }));

        mapObject = new Map(options);

        const layers = mapObject.getLayers().getArray();

        const vatnLayer = layers.filter((layer) => layer.get('name') === 'Vatn' ? true : false)[0];
        const vatnSource = vatnLayer ? vatnLayer.getSource() : undefined;

        if (!static) {
            const dragBox = new DragBox({condition: platformModifierKeyOnly});
            mapObject.addInteraction(dragBox);

            const waterSelectedLayer = layers.filter(layer => layer.get('name') === 'VatnSelected')[0];

            const selectDeselectFeatures = (features, deSelect = false, callback = () => {}) => {
                if (features.length === 0) return;
                const selectedFeatures = waterSelectedLayer.getSource().getFeatures().map(x => x.get('globalID'));
                features.forEach((f) => {
                    const pos = selectedFeatures.indexOf(f.get('globalID'));
                    if (pos < 0) {
                        waterSelectedLayer.getSource().addFeature(f);
                    } else {
                        if (deSelect) waterSelectedLayer.getSource().removeFeature(f);
                    }
                    if (callback) callback({ name: f.get(waterFieldName), properties: f.getProperties(), selected: pos < 0 });
                });
            }

            dragBox.on('boxend', (e) => {
                if (!vatnSource) return;
    
                const features = [];
                vatnSource.forEachFeatureIntersectingExtent(dragBox.getGeometry().getExtent(), (f) => {
                    features.push(f);
                });
                selectDeselectFeatures(features);
            });

            mapObject.on('click', (e) => {
                if (!vatnSource) return;
    
                const features = [];
                mapObject.forEachFeatureAtPixel(e.pixel, (f) => {
                    const featureLayerName = f.get('_layerName');
                    // console.log('feature', featureLayerName, f);
                    if (featureLayerName && featureLayerName === 'Vatn') {
                        features.push(f);
                        return true;
                    }
                    return false;
                });
                selectDeselectFeatures(features, true, onClick);
            });
        } else {
            mapObject.on('click', (e) => {
                if (!vatnSource) return;
    
                const features = [];
                mapObject.forEachFeatureAtPixel(e.pixel, (f) => {
                    const featureLayerName = f.get('_layerName');
                    // console.log('feature', featureLayerName, f);
                    if (featureLayerName && featureLayerName === 'Vatn') {
                        features.push(f);
                        return true;
                    }
                    return false;
                });
                if (features.length === 0) return;
                features.forEach((f) => {
                    onClick({ name: f.get(waterFieldName), properties: f.getProperties() });
                });
            });
        }

        mapObject.setTarget(mapRef.current);
        setMap(mapObject);

        setPointerMove(mapObject);

        // Fit extent
        mapObject.getView().fit(mapExtent);

		return () => mapObject.setTarget(undefined);
    }, [showRegion]);

    return (
        <div>
            <MapContext.Provider value={{ map }}>
                <div ref={mapRef} className="ol-map"></div>
    		</MapContext.Provider>
        </div>
	)
}
export default SimpleMap;
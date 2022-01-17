import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import 'ol/ol.css';
import styles from './MapOpenLayers.css'; // don't delete. it's used to move buttons to the right side
import { Collection, Feature, Map, View, Overlay } from 'ol';
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
    onChange,
    isWaterArea,
    selectAll,
    assessmentArea,
    selectedArea,
    static,
    mapIndex
}) => {
    const mapRef = useRef();
	const [map, setMap] = useState(null);
    const [pointerMoveTarget, setPointerMoveTarget] = useState(undefined);
    let mapObject;
    let mapCenter = [];
    let featureOver;
    const waterFieldName = isWaterArea ? 'vannomraadenavn' : 'vannregionnavn';
    // console.log('vatn?', isWaterArea, waterFieldName);
    console.log('SimpleMap', selectedArea);

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

    const createPopupElement = (isStatic, index) => {
        const contentElement = document.createElement('div');
        contentElement.className = `ol-popup-content ol-popup-content-${index}`;
        const element = document.createElement('div');
        element.className = `ol-popup ol-popup-${index} ${isStatic ? 'ol-popup-static' : 'ol-popup-anchor'}`;
        element.appendChild(contentElement);
        return element;
    }

    const setPointerMove = (mapObject) => {

        const overlay = mapObject.getOverlayById(`overlay_${mapIndex}`);
        if (!overlay.getElement()) {
            const elements = document.getElementsByClassName(`ol-popup ol-popup-${mapIndex}`);
            if (elements.length === 1) {
                overlay.setElement(elements[0]);
            } else {
                overlay.setElement(createPopupElement(static, mapIndex));
            }
        }

        const pointermove = (e) => {

            const vatnLayer = mapObject.getLayers().getArray().filter((layer) => layer.get('name') === 'Vatn' ? true : false)[0];
            if (!vatnLayer) return;
            const vatnSource = vatnLayer.getSource();
            if (!vatnSource) return;

            const hoverLayer = mapObject.getLayers().getArray().filter(layer => layer.get('name') === 'hoverLayer')[0];

            const content = document.getElementsByClassName(`ol-popup-content ol-popup-content-${mapIndex}`)[0];
            content.innerHTML = '';
    
            const vatn = [];
            mapObject.forEachFeatureAtPixel(e.pixel, (f) => {
                const featureLayerName = f.get('_layerName');
                // console.log('feature', featureLayerName, f);
                if (featureLayerName && featureLayerName === 'Vatn') {
                    if (!e.dragging) {
                        if (content) {
                            // Show name with faded font if feature is disabled
                            let waterClassname = f.get('disabled') === true ? ' class=\'ol-popup-feature-disabled\'' : '';
                            content.innerHTML = `<p${waterClassname}>${f.get(waterFieldName)}</p>`;
                            const coordinate = static ? [55000, 7900000] : e.coordinate;
                            overlay.getElement().style.opacity = 1;
                            overlay.setPosition(coordinate);
                            // closer.style.display = 'none';
                        }
                    }
                    vatn.push(f);
                    return true;
                }
                return false;
            });

            if (content.innerHTML.length === 0) {
                overlay.getElement().style.opacity = 0;
                // overlay.setPosition(undefined);
                // closer.blur();
            }

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
        // console.log('SimpleMap1', selectedArea);
        if (!map) return;

        const vatnLayer = map.getLayers().getArray().filter((layer) => layer.get('name') === 'Vatn' ? true : false)[0];
        if (!vatnLayer) return;
        const layers = map.getLayers().getArray();
        const waterSelectedLayer = layers.filter(layer => layer.get('name') === 'VatnSelected')[0];
        
        let features = [];
        waterSelectedLayer.getSource().clear();
        if (selectAll) {
            features = vatnLayer.getSource().getFeatures();
            features.forEach(f => {
                f.set('disabled', false);
            });
            waterSelectedLayer.getSource().addFeatures(features);
        } else {
            features = vatnLayer.getSource().getFeatures();
            features.forEach(f => {
                f.set('disabled', true);
            });
        }

        // console.log('selectAll changed', selectAll, features);
    }, [selectAll]);

	useEffect(() => {
        // console.log('SimpleMap2', selectedArea);

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

        // Popup
        let overlayOptions = {
            id: `overlay_${mapIndex}`,
            element: createPopupElement(static, mapIndex),
        };
        // if (!static) {
        //     overlayOptions.autoPan = {
        //         animation: {
        //             duration: 250,
        //         },
        //     };
        // }

        const overlay = new Overlay(overlayOptions);

        // closer.onclick = () => {
        //     overlay.setPosition(undefined);
        //     closer.blur();
        //     return false;
        // };

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
        let waterSelectedLayer;

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
        }
        if (static) {
            options.layers.push(mapOlFunc.createWaterLayer('Vatn', isWaterArea, projection, '', selectedArea, () => {}));
        } else {
            options.layers.push(mapOlFunc.createWaterLayer('Vatn', isWaterArea, projection, '', undefined, () => {}));
        }
        options.layers.push(new VectorLayer({
            name: 'hoverLayer',
            source: new VectorSource({wrapX: false, _text: false}),
            style: mapOlFunc.hoverStyleFunction,
            zIndex: 3
        }));
        options.overlays = [overlay];

        mapObject = new Map(options);

        const layers = mapObject.getLayers().getArray();

        const selectDeselectFeatures = (features, deSelect = false, changeCallback, clickCallback) => {
            if (features.length === 0) return;
            const selectedFeatures = waterSelectedLayer.getSource().getFeatures().map(x => x.get('globalID'));
            features.forEach((f) => {
                const pos = selectedFeatures.indexOf(f.get('globalID'));
                if (pos < 0) {
                    waterSelectedLayer.getSource().addFeature(f);
                } else {
                    if (deSelect) waterSelectedLayer.getSource().removeFeature(f);
                }
                if (clickCallback) clickCallback({ name: f.get(waterFieldName), properties: f.getProperties(), selected: pos < 0 });
            });
            if (changeCallback) changeCallback(waterSelectedLayer.getSource().getFeatures().map(x => {
                return {
                    globalID: x.get('globalID'),
                    name: x.get(waterFieldName)
                }
            }));
        };

        const featuresLoadend = () => {
            vatnSource.un('featuresloadend', featuresLoadend);
            const selectedGids = selectedArea.map(x => x.globalID);
            const preSelected = vatnSource.getFeatures().filter(x => selectedGids.indexOf(x.get('globalID')) >= 0);
            waterSelectedLayer.getSource().addFeatures(preSelected);
            console.log('preselect items', selectedGids, preSelected);
            selectDeselectFeatures(preSelected, undefined, onChange);
        };

        const vatnLayer = layers.filter((layer) => layer.get('name') === 'Vatn' ? true : false)[0];
        const vatnSource = vatnLayer ? vatnLayer.getSource() : undefined;
        if (!static) {
            mapOlFunc.createWaterSelectedLayer('VatnSelected', projection).then(l => {
                mapObject.addLayer(l);
                waterSelectedLayer = l;
                if (waterSelectedLayer && vatnSource && selectedArea) {
                    vatnSource.on('featuresloadend', featuresLoadend);
                }
            });
        } else {
            waterSelectedLayer = layers.filter(layer => layer.get('name') === 'VatnSelected')[0];
        }

        if (!static) {

            const dragBox = new DragBox({condition: platformModifierKeyOnly});
            mapObject.addInteraction(dragBox);

            // const waterSelectedLayer = layers.filter(layer => layer.get('name') === 'VatnSelected')[0];

            if (waterSelectedLayer && vatnSource && selectedArea) {
                vatnSource.on('featuresloadend', featuresLoadend);
            }

            dragBox.on('boxend', (e) => {
                if (!vatnSource) return;
    
                const features = [];
                vatnSource.forEachFeatureIntersectingExtent(dragBox.getGeometry().getExtent(), (f) => {
                    features.push(f);
                });
                selectDeselectFeatures(features, undefined, onChange);
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
                if (static) selectDeselectFeatures(features, true, undefined, onClick);
                else selectDeselectFeatures(features, true, onChange);
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

        mapRef.current.addEventListener('mouseout', () => {
            if (overlay.getElement()) overlay.getElement().style.opacity = 0;

            // setTimeout(() => { overlay.setPosition(undefined); }, 10);
            const hoverLayer = mapObject.getLayers().getArray().filter(layer => layer.get('name') === 'hoverLayer')[0];
            if (hoverLayer) hoverLayer.getSource().clear();
            setTimeout(() => {
                if (overlay.getElement()) overlay.getElement().style.opacity = 0;
            }, 100);
        });

        mapObject.setTarget(mapRef.current);
        setMap(mapObject);

        setPointerMove(mapObject);

        // Fit extent
        mapObject.getView().fit(mapExtent);

		return () => mapObject.setTarget(undefined);
    }, [isWaterArea, selectedArea]);

    return (
        <div>
            <MapContext.Provider value={{ map }}>
                <div ref={mapRef} className="ol-map"></div>
            </MapContext.Provider>
        </div>
	)
}
export default SimpleMap;
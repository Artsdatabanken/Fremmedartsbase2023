import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import 'ol/ol.css';
import styles from './MapOpenLayers.css'; // don't delete. it's used to move buttons to the right side
import { Collection, Feature, Map, View } from 'ol';
import { Control, defaults as defaultControls } from 'ol/control';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, WMTS as WmtsSource } from 'ol/source';
import Proj4 from 'proj4';
import { addProjection, Projection } from 'ol/proj';
import MapContext from "./MapContext";
import mapOlFunc from './MapOlFunctions';
import config from '../../config';

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
    showRegion,
    onClick,
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

    setPointerMove = (mapObject) => {

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
            layers: [
                mapOlFunc.createWaterLayer('Vatn', showRegion ? 14 : 15, projection, '', () => {}),
                new VectorLayer({
                    name: 'hoverLayer',
                    source: new VectorSource({wrapX: false, _text: false}),
                    style: mapOlFunc.hoverStyleFunction,
                    zIndex: 3
                })
            ],
            controls: defaultControls({attribution: false, zoom: false}),
            interactions: new Collection(),
        };

        mapObject = new Map(options);

        mapObject.setTarget(mapRef.current);
        setMap(mapObject);

        setPointerMove(mapObject);

        mapObject.on('click', (e) => {
            const vatnLayer = mapObject.getLayers().getArray().filter((layer) => layer.get('name') === 'Vatn' ? true : false)[0];
            if (!vatnLayer) return;
            const vatnSource = vatnLayer.getSource();
            if (!vatnSource) return;

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
            if (vatn.length > 0) onClick({ name: vatn[0].get(waterFieldName) });
        });

        // Fit extent
        mapObject.getView().fit(mapExtent);

		return () => mapObject.setTarget(undefined);
    }, []);

    return (
        <div>
            <MapContext.Provider value={{ map }}>
                <div ref={mapRef} className="ol-map"></div>
    		</MapContext.Provider>
        </div>
	)
}
export default SimpleMap;
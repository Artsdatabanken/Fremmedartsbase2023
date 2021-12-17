import React, { useRef, useState, useEffect } from "react"
import 'ol/ol.css';
import styles from './MapOpenLayers.css'; // don't delete. it's used to move buttons to the right side
import MapContext from "./MapContext";
import { Feature, Map, View } from 'ol';
import { Control, defaults as defaultControls } from 'ol/control';
import { Draw, Snap } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { getTopLeft,getWidth } from 'ol/extent';
import { Point, Polygon } from "ol/geom";
import Projection from 'ol/proj/Projection';
import { GeoJSON as GeoJSONFormat } from 'ol/format';
import Proj4 from 'proj4';
import { addProjection } from 'ol/proj';
import { Vector as VectorSource, VectorTile as VectorTileSource, WMTS as WmtsSource } from 'ol/source';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import config from '../../config';

const MapOpenLayers = ({
    showWaterAreas,
    children,
    onAddPoint,
    onEdit,
    style,
    mapBounds,
    geojson,
    selectionGeometry,
    onClickPoint,
    onHover,
    onClosed
}) => {
    const mapRef = useRef();
    const [visibleLegend, setVisibleLegend] = useState(false);
	const [map, setMap] = useState(null);
    const numZoomLevels = 18;
    const mapZoom = 3.7;
    const extent = [-2500000.0, 3500000.0, 3045984.0, 9045984.0];
    let mapObject;
    let mapCenter = [];
    let mouseoverfeature = null;
    let defaultStyles;
    let hoverStyles;
    let featureOver;
    let drawPolygonInteraction;
    let waterLayerName;
    const vectorFeatures = {};
    const colors = {
        '1': '',
        '1TO': '',
        '2': '',
        '5': '',
        '1101': '',
        '1106': '',
        '1107': '',
        '1108': '',
        '1109': '',
        '5103': '',
        '5104': '',
        '5107': '',
        '5108': '',
        '5109': '',
        'VHA5': '',
        'VHA6': '',
    };

    //if (!mapBounds) mapBounds = [[57, 4.3], [71.5, 32.5]];

    // console.log('MapOpenLayers', geojson, selectionGeometry);
  
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
    };
    const createMarker = (coordinate) => {
        if (mouseoverfeature) {
            // console.log('mouseover', mouseoverfeature.getProperties());
            const latlng = mouseoverfeature.get('latlng');
            removeMarker(latlng);
        } else {
            // console.log('createMarker()', coordinate);
            onAddPoint({
            latlng:
            {
                lng: coordinate[0],
                lat: coordinate[1]
            }
            });
        }
    };
    const removeMarker = (coordinate) => {
        onClickPoint({
            lng: coordinate[0],
            lat: coordinate[1]
        });
    };
    const wmtsTileGrid = (numZoomLevels,matrixSet,projection, startLevel) => {
        let resolutions = new Array(numZoomLevels);
        let matrixIds = new Array(numZoomLevels);
        
        // console.log('wmtsTileGrid()', numZoomLevels, matrixSet, projection);
        let projectionExtent = projection.getExtent();

        let size = getWidth(projectionExtent) / 256;
        
        startLevel = startLevel ? startLevel : 0;
        for (let z = startLevel; z < (numZoomLevels + startLevel); ++z) {
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

    const createTextStyleFunction = (feature) => {
        return new Text({
            text: feature.get(waterLayerName) ? feature.get(waterLayerName) : undefined
        });
    };

    const setColors = () => {
        // const getRandomColor = () => {
        //     var letters = '0123456789ABCDEF';
        //     var color = '#';
        //     for (var i = 0; i < 6; i++) {
        //         color += letters[Math.floor(Math.random() * 16)];
        //     }
        //     return color;
        // };
        const palette = [
            '#86CFEF',
            '#4B6CA6',
            '#89C1DA',
            '#CFE7F1',
            '#6493B5',
            '#9EC1ED',
            '#6391E8',
            '#345995',
            '#AAC6DF',
            '#5B8BC8',
            '#6582A5',
            '#7C9ED7',
            '#72AFCE',
            '#86CFEF',
            '#a7a2a9',
            '#86CFEF' // '#daffed'
        ];
        let i = 0;
        for (var key in colors) {
            // colors[key] = getRandomColor();
            colors[key] = palette[i];
            console.log(`${i}\t${colors[key]}\t%c    `, `background: ${colors[key]};color: ${colors[key]};`);
            i++;
        }
        // console.log('colors', colors);
    };

    const internalStyleFunction = (feature, hover) => {
        const stroke = new Stroke({
            // color: hover ? '#3399CCFF' : '#3399CCAA',
            // width: hover ? 2 : 1.25,
            // color: hover = hover ? `${colors[feature.get('vannregionID')]}FF` : `${colors[feature.get('vannregionID')]}AA`,
            // color: hover ? '#3399CCFF' : `${colors[feature.get('vannregionID')]}AA`,
            // color: hover ? '#3399CCFF' : '#FFFFFFAA',
            color: hover ? `${colors[feature.get('vannregionID')]}FF` : '#FFFFFFAA',
            width: hover ? 4 : 2,
        });
        const fill = new Fill({
            // color: 'rgba(255,255,255,0.4)'
            // color: hover ? `${colors[feature.get('vannregionID')]}AA` : `${colors[feature.get('vannregionID')]}00`
            color: hover ? `${colors[feature.get('vannregionID')]}AA` : `${colors[feature.get('vannregionID')]}88`
        });
        return new Style({
            image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 5,
            }),
            fill: fill,
            stroke: stroke
        });
    };

    const hoverStyleFunction = (feature, resolution) => {
        if (!hoverStyles || true) {
            hoverStyles = internalStyleFunction(feature, true);
        }
        const style = hoverStyles.clone();
        style.setText(createTextStyleFunction(feature));
        return [style];
    };

    const styleFunction = (feature, resolution) => {
        if (!defaultStyles || true) {
            defaultStyles = internalStyleFunction(feature, false);
        }
        const defaultStyle = defaultStyles.clone();
        defaultStyle.setText(createTextStyleFunction(feature, false));
        return [defaultStyle];
    };

    const createWaterLayer = (name, layerid, projection, waterLayerName, setWaterLayerNameCallback) => {
        // const vannUrl = 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/';
        // const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Mapservices/Elspot/MapServer/';
        // layerid = '0';

        setColors();

        const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Vanndirektiv/MapServer/';
        layerid = 14; // Vannregion
        layerid = 15; // Vannomraade

        const props = {};

        const source = new VectorTileSource({
            extent: extent,
            projection: projection,
            format: new GeoJSONFormat({
                dataProjection: projection,
                featureProjection: projection,
                geometryName: 'geometry'
            }),
            url: `${vannUrl}?x={x}&y={y}&z={z}`,
            tileGrid: wmtsTileGrid(1, `EPSG:${config.mapEpsgCode}`, projection, Math.floor(mapZoom)),
            tileLoadFunction: async (tile, tileurl) => {
                let url = vannUrl;
                url += layerid;
                url += '/query';
                url += '?where=';
                url += '&text=';
                url += '&objectIds=';
                url += '&time=';
                url += `&geometry=${tile.extent.join(',')}`;
                url += '&geometryType=esriGeometryEnvelope';
                url += `&inSR=${config.mapEpsgCode}`;
                url += '&spatialRel=esriSpatialRelIntersects';
                url += '&outFields=*';
                url += '&relationParam=';
                url += '&outFields=';
                url += '&returnGeometry=true';
                url += '&returnTrueCurves=true';
                url += '&maxAllowableOffset=';
                url += '&geometryPrecision=';
                url += `&outSR=${config.mapEpsgCode}`;
                url += '&returnIdsOnly=false';
                url += '&returnCountOnly=false';
                url += '&orderByFields=';
                url += '&groupByFieldsForStatistics=';
                url += '&outStatistics=';
                url += '&returnZ=false';
                url += '&returnM=false';
                url += '&gdbVersion=';
                url += '&returnDistinctValues=false';
                url += '&resultOffset=';
                url += '&resultRecordCount=';
                url += '&queryByDistance=';
                url += '&returnExtentsOnly=true';
                url += '&datumTransformation=';
                url += '&parameterValues=';
                url += '&rangeValues=';
                url += '&f=geojson';
                const response = await fetch(url);
                const data = await response.json();
                if (data.error) return;
                const format = tile.getFormat();
                const features = format.readFeatures(data);
                if (!vectorFeatures[name]) vectorFeatures[name] = [];
                features.forEach((feature) => {
                    feature.set('_layerName', name);
                    if (!waterLayerName && setWaterLayerNameCallback) {
                        waterLayerName = feature.get('Name') ? 'Name' : feature.get('vannomraadenavn') ? 'vannomraadenavn' : undefined;
                        setWaterLayerNameCallback(waterLayerName);
                    }
                    // // console.log('feature', feature.getProperties());
                    // if (!props['vannregionID']) props['vannregionID'] = {};
                    // if (!props['vannregionkoordinatorID']) props['vannregionkoordinatorID'] = {};
                    
                    // if (props['vannregionID'][feature.get('vannregionID')]) {
                    //     props['vannregionID'][feature.get('vannregionID')]++;
                    //     props['vannregionkoordinatorID'][feature.get('vannregionkoordinatorID')]++;
                    // } else {
                    //     props['vannregionID'][feature.get('vannregionID')] = 1;
                    //     props['vannregionkoordinatorID'][feature.get('vannregionkoordinatorID')] = 1;
                    // }
                    // console.log('props', props);
                    vectorFeatures[name].push(feature);
                });
                tile.setFeatures(features);
            },
            crossOrigin: 'anonymous'
        });
        const layer = new VectorTileLayer({
            name: name,
            opacity: 1,
            renderMode: 'vector',
            source: source,
            style: styleFunction,
            visible: true
        });

        // window.setInterval(() => {
        //     layer.getSource().dispatchEvent('change');
        //   }, 3000);

        return layer;
    }

    const toggleLegend = () => {
        console.log('visible', visibleLegend);
        var visible = visibleLegend ? false : true;
        console.log('visible', visible);
        setVisibleLegend(visible);
    }

    const cancelDrawPolygon = () => {
        if (!mapObject) return;
        // console.log('remove interaction');
        mapObject.removeInteraction(drawPolygonInteraction);
        drawPolygonInteraction = null;
    }

    const drawPolygon = () => {
        if (!mapObject) return;
        if (drawPolygonInteraction) {
            // console.log('remove drawPolygonInteraction');
            cancelDrawPolygon();
            return;
        }
        // console.log('add drawPolygonInteraction');
        const markerLayer = mapObject.getLayers().getArray().filter((layer) => layer.get('name') === 'markerLayer' ? true : false)[0];
        if (!markerLayer) return;
        const markerSource = markerLayer.getSource();
        if (!markerSource) return;

        drawPolygonInteraction = new Draw({
            source: markerSource,
            type: 'Polygon'
        });
        // drawPolygonInteraction.on('change', (e) => {
        //     console.log('change drawPolygonInteraction');
        // });
        drawPolygonInteraction.on('drawend', (e) => {
            // console.log('drawend', e.feature);
            // const polygon = (new GeoJSONFormat()).writeFeature(e.feature);
            // console.log('polygon', polygon);
            setTimeout(() => {
                cancelDrawPolygon();
                onEdit((new GeoJSONFormat()).writeFeature(e.feature));
            }, 0);
        });
        mapObject.addInteraction(drawPolygonInteraction);
    }

    const createButton = (options) => {
        const button = document.createElement('button');
        // button.className = 'ol-polygon-button';
        button.type = 'button';
        button.innerHTML = options.innerHTML;
        if (options.style) button.style = options.style;
        if (options.click) {
            button.addEventListener('click', options.click, false);
            button.addEventListener('touchstart', options.click, false);
        }
        return button;
    }

	// on component mount
	useEffect(() => {
        const mapControls = [];
        const customElement = document.createElement('div');
        customElement.className = 'ol-legend ol-unselectable ol-control';

        // customElement.appendChild(createButton({
        //     click: toggleLegend,
        //     innerHTML: '&vert;&vert;&vert;',
        //     style: 'transform: rotate(90deg);'
        // }));

        customElement.appendChild(createButton({
            click: drawPolygon,
            innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="22" height="22" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><path d="M14 4c-1.105 0-2 .895-2 2v.063L6.937 9.25A2.009 2.009 0 0 0 6 9c-1.105 0-2 .895-2 2c0 .738.402 1.371 1 1.719V24.28c-.598.348-1 .98-1 1.719c0 1.105.895 2 2 2c.738 0 1.371-.402 1.719-1H20.28c.348.598.98 1 1.719 1c1.105 0 2-.895 2-2c0-.398-.11-.781-.313-1.094L26.125 20a2.005 2.005 0 0 0 .25-3.969l-1.906-5.718C24.785 9.957 25 9.511 25 9c0-1.105-.895-2-2-2c-.512 0-.957.215-1.313.531L15.97 5.594A2.012 2.012 0 0 0 14 4zm1.313 3.5l5.718 1.875c.153.805.79 1.441 1.594 1.594l1.906 5.687A1.99 1.99 0 0 0 24 18c0 .414.129.805.344 1.125L21.875 24a1.988 1.988 0 0 0-1.594 1H7.72A1.981 1.981 0 0 0 7 24.281V12.72c.598-.348 1-.98 1-1.719v-.063l5.063-3.187c.28.148.597.25.937.25c.504 0 .96-.191 1.313-.5z" fill="currentColor"/></svg>'
        }));

        mapControls.push(new Control({ element: customElement }));

        if (Proj4.defs(`EPSG:${config.mapEpsgCode}`) === undefined) {
            Proj4.defs(`EPSG:${config.mapEpsgCode}`, config.mapEpsgDef);
        }
        const projection = new Projection({
            code: `EPSG:${config.mapEpsgCode}`,
            extent: extent,
            units: 'm'
        });
        addProjection(projection);
      
        const mapExtent = [transformCoordinate(4326, config.mapEpsgCode, [mapBounds[0][1], mapBounds[0][0]]), transformCoordinate(4326, config.mapEpsgCode, [mapBounds[1][1], mapBounds[1][0]])].flat();
        mapCenter = [mapExtent[0] + (mapExtent[2] - mapExtent[0]) / 2, mapExtent[1] + (mapExtent[3] - mapExtent[1]) / 2];
        const hoverLayer = new VectorLayer({
            name: 'hoverLayer',
            source: new VectorSource({wrapX: false, _text: false}),
            style: hoverStyleFunction
        });
        const areaLayer = new VectorLayer({name: 'areaLayer', source: new VectorSource({wrapX: false})});
        const markerLayer = new VectorLayer({name: 'markerLayer', source: new VectorSource({wrapX: false})});
        let options = {
            view: new View({
                center: mapCenter,
                projection: `EPSG:${config.mapEpsgCode}`,
                maxZoom: numZoomLevels,
                zoom: 0// mapZoom
            }),
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
                        matrixSet: `EPSG:${config.mapEpsgCode}`,
                        format: 'image/png',
                        projection: projection,
                        tileGrid: wmtsTileGrid(numZoomLevels, `EPSG:${config.mapEpsgCode}`, projection),
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
                        matrixSet: `EPSG:${config.mapEpsgCode}`,
                        format: 'image/png',
                        projection: projection,
                        tileGrid: wmtsTileGrid(numZoomLevels, `EPSG:${config.mapEpsgCode}`, projection),
                        style: 'default',
                        wrapX: true,
                        crossOrigin: 'anonymous'
                    }),
                    visible: true
                })
            ],
            controls: defaultControls({attribution: false}).extend(mapControls),
        };

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

            waterLayerName = undefined;

            const setWaterLayerName = (name) => {
                waterLayerName = name;
            };

            options.layers.push(createWaterLayer('Vatn', 2, projection, waterLayerName, setWaterLayerName));
        }
        options.layers.push(hoverLayer);
        options.layers.push(areaLayer);
        options.layers.push(markerLayer);

        mapObject = new Map(options);

        mapObject.setTarget(mapRef.current);
		setMap(mapObject);
        // console.log('map initialize', mapObject.getTarget());

        // mapObject.updateSize();

        mapObject.on('click', (e) => {
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

        mapObject.on('pointermove', (e) => {
            if (drawPolygonInteraction) return;
            const markerLayer = mapObject.getLayers().getArray().filter((layer) => layer.get('name') === 'markerLayer' ? true : false)[0];
            if (!markerLayer) return;
            const markerSource = markerLayer.getSource();
            if (!markerSource) return;

            const pixelOffset = 3;
            const max = mapObject.getCoordinateFromPixel([e.pixel[0] + pixelOffset, e.pixel[1] - pixelOffset]);
            const min = mapObject.getCoordinateFromPixel([e.pixel[0] - pixelOffset, e.pixel[1] + pixelOffset]);
            const extent = [min[0], min[1], max[0], max[1]];
            const features = markerSource.getFeaturesInExtent(extent);
            if (features && features.length > 0) {
                // console.log('pointermove', features);
                mouseoverfeature = features[0];
                mapObject.getTargetElement().style.cursor = 'pointer';
                // document.getElementById('olmap').style.cursor = 'pointer';
            } else {
                mouseoverfeature = null;
                mapObject.getTargetElement().style.cursor = 'crosshair';
                // document.getElementById('olmap').style.cursor = 'crosshair';
            }
        });

        mapObject.on('pointermove', (e) => {
            const layerName = 'Vatn';
            const vatnLayer = mapObject.getLayers().getArray().filter((layer) => layer.get('name') === layerName ? true : false)[0];
            if (!vatnLayer) return;
            const vatnSource = vatnLayer.getSource();
            if (!vatnSource) return;

            const vatn = [];
            mapObject.forEachFeatureAtPixel(e.pixel, (f) => {
                const featureLayerName = f.get('_layerName');
                if (featureLayerName && featureLayerName === layerName) {
                    vatn.push(f);
                    return true;
                }
                return false;
            });

            const hoverSource = hoverLayer.getSource();
            if (vatn && vatn.length > 0) {
                const name = vatn[0].get(waterLayerName);
                if (featureOver && featureOver.get(waterLayerName) === name) return;
                if (featureOver) hoverSource.clear();

                featureOver = vatn[0];
                vectorFeatures[layerName]
                .filter((feature) => feature.get(waterLayerName) === name)
                .forEach((sourceFeature) => {
                    hoverSource.addFeature(sourceFeature);
                });
                onHover(name);
            } else if (vectorFeatures[layerName] && vectorFeatures[layerName].length > 0) {
                featureOver = undefined;
                hoverSource.clear();
                onHover();
            }
        });

        // Fit extent
        mapObject.getView().fit(mapExtent);

		return () => mapObject.setTarget(undefined);
	}, []);

    const drawUtbredelse = () => {
		if (!map) return;

        const layers = map.getLayers().getArray();
        const areaLayer = layers.filter((layer) => layer.get('name') === 'areaLayer' ? true : false)[0];
        const markerLayer = layers.filter((layer) => layer.get('name') === 'markerLayer' ? true : false)[0];

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
            geojson.features.forEach(geojsonfeature => {
                // console.log('feature', geojsonfeature);
                let geometry = null;
                const latlng = [...geojsonfeature.geometry.coordinates];
                // console.log(geojsonfeature.geometry.coordinates);
                if (geojsonfeature.geometry.type === 'Point') {
                    const coordinate = transformCoordinate(geojsonCrsCode, config.mapEpsgCode, geojsonfeature.geometry.coordinates);
                    geometry = new Point(coordinate);
                } else if (geojsonfeature.geometry.type === 'Polygon') {
                    const coordinates = [[]];
                    geojsonfeature.geometry.coordinates[0].forEach(coordinate => {
                        coordinates[0].push(transformCoordinate(geojsonCrsCode, config.mapEpsgCode, coordinate));
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
            // console.log('summary', areaSource.getFeatures(), markerSource.getFeatures());
        }
        if (selectionGeometry) {
            // console.log('selectionGeometry', selectionGeometry);
            const selectionFeature = (new GeoJSONFormat()).readFeature(selectionGeometry);
            // console.log(selectionFeature);
            areaSource.addFeature(selectionFeature);
        }
    };

    useEffect(drawUtbredelse, [geojson]);

	return (
        <div>
            <div>{visibleLegend && (<span>{"tegnforklaring"}</span>)}</div>
            <MapContext.Provider value={{ map }}>
                <div ref={mapRef} className="ol-map" style={{cursor: 'crosshair'}}>
                    {children}
                </div>
    		</MapContext.Provider>
        </div>
	)
}

export default MapOpenLayers;
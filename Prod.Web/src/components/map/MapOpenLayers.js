import React, { useRef, useState, useEffect } from "react"
import 'ol/ol.css';
import styles from '../artskart/KartOpenLayers.css';
import MapContext from "./MapContext";
import { Feature, Map, View } from 'ol';
import { Control, defaults as defaultControls, MousePosition } from 'ol/control';
import { Draw, Snap } from 'ol/interaction';
import { Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { getTopLeft,getWidth } from 'ol/extent';
import { GeometryCollection, Point, Polygon } from "ol/geom";
import { fromExtent } from 'ol/geom/Polygon';
import Projection from 'ol/proj/Projection';
import { GeoJSON as GeoJSONFormat } from 'ol/format';
import Proj4 from 'proj4';
import { addProjection } from 'ol/proj';
import { OSM, Vector as VectorSource, VectorTile as VectorTileSource, WMTS as WmtsSource, Image as ImageSource, ImageArcGISRest, TileArcGISRest } from 'ol/source';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import config from '../../config';

const MapOpenLayers = ({
    children,
    onAddPoint,
    onEdit,
    style,
    mapBounds,
    geojson,
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
    let mapCenter = [];
    let mouseoverfeature = null;
    let defaultStyles;
    let hoverStyles;
    let featureOver;
    const vectorFeatures = {};

    if (!mapBounds) mapBounds = [[57, 4.3], [71.5, 32.5]];

    // console.log('MapOpenLayers', geojson);
  
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
            // console.log('change drawInteraction');
        });
        drawInteraction.on('drawend', (e) => {
            // console.log('drawend', e);
            const coordinate = e.feature.getGeometry().getCoordinates();
            const features = markerSource.getFeaturesAtCoordinate(coordinate);
            // console.log('features', features);
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
        // snapInteraction.on('propertychange', e => console.log('snap change', e));
        mapObject.addInteraction(snapInteraction);
    };
    const createMarker = (coordinate) => {
        // return L.circleMarker(latlng).on("click", e => {
        //   L.DomEvent.stopPropagation(e);
        //   onClickPoint(latlng);
        // });
        if (mouseoverfeature) {
            console.log('mouseover', mouseoverfeature.getProperties());
            const latlng = mouseoverfeature.get('latlng');
            removeMarker(latlng);
        } else {
            console.log('createMarker()', coordinate);
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
        // const latlng = Proj4(epsg, 'EPSG:4326', coordinate);
        console.log('removeMarker()', coordinate);

        // return L.circleMarker(latlng).on("click", e => {
        //   L.DomEvent.stopPropagation(e);
        //   onClickPoint(latlng);
        // });
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
            text: feature.get('Name') ? feature.get('Name') : undefined
        });
    };

    const internalStyleFunction = (hover) => {
        const stroke = new Stroke({
            // color: hover ? '#66CCFF' : '#3399CC',
            // color: hover ? '#1177AA' : '#3399CC',
            color: '#3399CC',
            width: hover ? 2 : 1.25,
        });
        const fill = new Fill({
            // color: 'rgba(255,255,255,0.4)'
            color: hover ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0)'
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
        if (!hoverStyles) {
            hoverStyles = internalStyleFunction(true);
        }
        const style = hoverStyles.clone();
        style.setText(createTextStyleFunction(feature));
        return [style];
    };

    const styleFunction = (feature, resolution) => {
        if (!defaultStyles) {
            defaultStyles = internalStyleFunction(false);
        }
        const defaultStyle = defaultStyles.clone();
        defaultStyle.setText(createTextStyleFunction(feature, false));
        return [defaultStyle];
    };

    const createWaterLayer = (name, layerid, projection) => {
        const source = new VectorTileSource({
            extent: extent,
            projection: projection,
            format: new GeoJSONFormat({
                dataProjection: projection,
                featureProjection: projection,
                geometryName: 'geometry'
            }),
            url: 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/?x={x}&y={y}&z={z}',
            tileGrid: wmtsTileGrid(1, `EPSG:${config.mapEpsgCode}`, projection, Math.floor(mapZoom)),
            tileLoadFunction: async (tile) => {
                let url = 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/';
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

	// on component mount
	useEffect(() => {
        // console.log('MapOpenLayers - creating map', visibleLegend);
        // let options = {
		// 	view: new View({ zoom: 9, center: [-94.9065, 38.9884] }),
		// 	layers: [],
		// 	controls: [],
		// 	overlays: []
		// };

        const mapControls = [];
        // const customElement = document.createElement('div');
        // customElement.className = 'ol-legend ol-unselectable ol-control';

        // const toggleLegendButton = document.createElement('button');
        // toggleLegendButton.type = 'button';
        // // icons from https://www.w3schools.com/bootstrap/bootstrap_ref_comp_glyphs.asp
        // // toggleLegendButton.className = 'ol-legend-button';
        // // toggleLegendButton.style = 'background-position: center; background-repeat: no-repeat;';
        // toggleLegendButton.innerHTML = '&vert;&vert;&vert;';
        // // toggleLegendButton.title = resource.res().olLegendButton;
        // toggleLegendButton.addEventListener('click', toggleLegend, false);
        // toggleLegendButton.addEventListener('touchstart', toggleLegend, false);
        // customElement.appendChild(toggleLegendButton);

        // mapControls.push(new Control({ element: customElement }));

		// let mapObject = new Map(options);
		// mapObject.setTarget(mapRef.current);
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
        // console.log('mapCenter', center, mapCenter);
        // const view = new View({
        //     center: center,
        //     projection: `EPSG:${config.mapEpsgCode}`,
        //     maxZoom: numZoomLevels,
        //     zoom: initialZoom
        // });
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
                zoom: mapZoom
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
                }),
                new TileLayer({
                    name: 'Vannområder',
                    opacity: 1,
                    extent: extent,
                    source: new TileArcGISRest({
                    // source: new ImageArcGISRest({
                    // source: new ImageSource({
                        //?dpi=96
                        // &transparent=true
                        // &format=png32
                        // &layers=show%3A2%2C9
                        // &bbox=330256.5513175976%2C7799000.9230466%2C1693893.1359247793%2C9446371.75664828
                        // &bboxSR=102100
                        // &imageSR=102100
                        // &size=1115%2C1347
                        // &f=image
                        url: 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/',
                        params: {
                            // BBOXSR: config.mapEpsgCode,
                            // IMAGESR: config.mapEpsgCode,
                            LAYERS: 'show:2,9'
                        },
                        projection: projection,
                        tileGrid: wmtsTileGrid(numZoomLevels, `EPSG:${config.mapEpsgCode}`, projection),
                        // imageLoadFunction: (a,b,c) => {console.log('imageLoadFunction', a, b, c);},
                        crossOrigin: 'anonymous'
                    }),
                    visible: false
                }),
                createWaterLayer('Vatn', 2, projection),
                hoverLayer,
                areaLayer,
                markerLayer
            ],
            controls: defaultControls({attribution: false}).extend(mapControls),
        };

        let mapObject = new Map(options);

        mapObject.setTarget(mapRef.current);
		setMap(mapObject);
        // console.log('map initialize', mapObject.getTarget());

        // mapObject.updateSize();

        mapObject.on('click', (e) => {
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
                const name = vatn[0].get('Name');
                if (featureOver && featureOver.get('Name') === name) return;
                if (featureOver) hoverSource.clear();

                featureOver = vatn[0];
                vectorFeatures[layerName]
                .filter((feature) => feature.get('Name') === name)
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
    };

    // geojson change handler
    // useEffect(() => {
    //     drawUtbredelse();
    // }, [geojson]);
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
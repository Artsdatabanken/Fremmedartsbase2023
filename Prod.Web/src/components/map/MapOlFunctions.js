import { getTopLeft, getWidth } from 'ol/extent';
import { GeoJSON as GeoJSONFormat } from 'ol/format';
import { Vector as VectorLayer } from 'ol/layer';
import { Projection } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Circle, Icon, Fill, Stroke, Style, Text } from 'ol/style';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import auth from '../authService'
import config from '../../config';

let defaultStyles;
let hoverStyles;
let waterLayerName;
let gradient;

const numZoomLevels = 18;

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
const extent = [-2500000.0, 3500000.0, 3045984.0, 9045984.0];
const vectorFeatures = {};

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
        // console.log(`${i}\t${colors[key]}\t%c    `, `background: ${colors[key]};color: ${colors[key]};`);
        i++;
    }
    // console.log('colors', colors);
};

const createStyle = (geojsonfeature, style) => {
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

const createGradient = async () => {
    if (gradient) return gradient;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    // 20x20 image with rgba(0,0,0,0) diagonal line
    // img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAAlSURBVDhPY6AyaIDSVAGjhpEORg0jHYwaRjoYNYx0MCIMY2AAAJ0lCgF4ST6xAAAAAElFTkSuQmCC';
    // 20x20 image with rgba(0,0,0,128) diagonal line
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAAlSURBVDhPY6AyaIDSVAGjhpEORg0jHYwaRjoYNYx0MCIMY2AAAJ0lCgF4ST6xAAAAAElFTkSuQmCC';
    await img.decode();
    gradient = context.createPattern(img, 'repeat');
    return gradient;
};

const createWaterIntersectionStyle = async () => {
    
    const fillColor = await createGradient();
    const fill = new Fill({
        color: fillColor
    });
    const stroke = new Stroke({
        color: "#FF0000CC",
        width: 2
    });

    return new Style({
        fill: fill,
        stroke: stroke,
    });
};

const createTextStyleFunction = (feature) => {
    return new Text({
        text: feature.get(waterLayerName) ? feature.get(waterLayerName) : undefined
    });
};

const internalStyleFunction = (feature, mapIndex, hover) => {
    let fillColor;
    let strokeColor = hover ? `${colors[feature.get('vannregionID')]}FF` : '#FFFFFFAA';
    let strokeWidth = hover ? 4 : 2;
    if (mapIndex === undefined || mapIndex === 0) {
        if (feature.get('disabled') === true) {
            fillColor = `#d5d5d5${hover ? 'aa' : '88'}`;
            strokeColor = '#FFFFFFAA';
            strokeWidth = 2;
        } else {
            fillColor = `${colors[feature.get('vannregionID')]}${hover ? 'aa' : '88'}`;
        }
    } else {
        strokeWidth = hover ? 2 : 1;
        const selected = feature.get('selected');
        if (selected) {
            strokeColor = '#111111AA';
            switch (mapIndex) {
                case 1:
                    fillColor = `#D5B549${hover ? 'aa' : '88'}`;
                    break;
                case 2:
                    fillColor = `#C8C1B9${hover ? 'aa' : '88'}`;
                    break;
                case 3:
                    fillColor = `#866849${hover ? 'aa' : '88'}`;
                    break;
            }
        } else {
            if (feature.get('disabled') === true) {
                fillColor = `#d5d5d5${hover ? 'aa' : '88'}`;
            } else {
                strokeColor = '#111111AA';
                if (hover) {
                    switch (mapIndex) {
                        case 1:
                            fillColor = `#D5B549${hover ? 'aa' : '88'}`;
                            break;
                        case 2:
                            fillColor = `#C8C1B9${hover ? 'aa' : '88'}`;
                            break;
                        case 3:
                            fillColor = `#866849${hover ? 'aa' : '88'}`;
                            break;
                    }
                } else {
                    fillColor = `#FBF3F0${hover ? 'aa' : '88'}`;
                }
            }
        }
    }
    const stroke = new Stroke({
        // color: hover ? '#3399CCFF' : '#3399CCAA',
        // width: hover ? 2 : 1.25,
        // color: hover = hover ? `${colors[feature.get('vannregionID')]}FF` : `${colors[feature.get('vannregionID')]}AA`,
        // color: hover ? '#3399CCFF' : `${colors[feature.get('vannregionID')]}AA`,
        // color: hover ? '#3399CCFF' : '#FFFFFFAA',
        color: strokeColor,
        width: strokeWidth,
    });
    const fill = new Fill({
        // color: 'rgba(255,255,255,0.4)'
        // color: hover ? `${colors[feature.get('vannregionID')]}AA` : `${colors[feature.get('vannregionID')]}00`
        // color: hover ? `${colors[feature.get('vannregionID')]}AA` : `${colors[feature.get('vannregionID')]}88`
        color: fillColor
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

const hoverStyleFunction = (feature, resolution, mapIndex) => {
    // if (!hoverStyles || true) {
    //     hoverStyles = internalStyleFunction(feature, true);
    // }
    // const style = hoverStyles.clone();
    const style = internalStyleFunction(feature, mapIndex, true);
    style.setText(createTextStyleFunction(feature));
    return [style];
};

const styleFunction = (feature, resolution, mapIndex) => {
    // if (!defaultStyles || true) {
    //     defaultStyles = internalStyleFunction(feature, false);
    // }
    // const defaultStyle = defaultStyles.clone();
    const defaultStyle = internalStyleFunction(feature, mapIndex, false);
    defaultStyle.setText(createTextStyleFunction(feature));
    return [defaultStyle];
};

const convertMapIndex2State = (value) => {
    switch (value) {
        case 1:
            return 0;
        case 2:
            return 1;
        case 3:
            return 3;
        default:
            return 2;
    }
};

const createWaterLayer = (name, mapIndex, isWaterArea, initialWaterAreas, projection, waterLayerName, assessmentArea, setWaterLayerNameCallback) => {
    // const vannUrl = 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/'; // old service
    // const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Mapservices/Elspot/MapServer/'; // new service
    // layerid = '0';

    setColors();

    // geojson is saved and simplified with a 100m tolerance
    // layerid = 14; // Vannregion
    // layerid = 15; // Vannomraade
    const layerid = isWaterArea ? 15 : 14;

    if (vectorFeatures[name]) vectorFeatures[name].splice(0);

    const filterById = assessmentArea ? true : false;
    const validGids = assessmentArea ? assessmentArea.map(x => x.globalID) : undefined;
    const selectedGids = [];
    if (validGids && initialWaterAreas && initialWaterAreas.areaState && initialWaterAreas.regionState) {
        validGids.forEach(globalID => {
            if (initialWaterAreas.areaState[globalID]) {
                if (initialWaterAreas.areaState[globalID][`state${convertMapIndex2State(mapIndex)}`] === 1) {
                    selectedGids.push(globalID);
                }
            }
            if (initialWaterAreas.regionState[globalID]) {
                if (initialWaterAreas.regionState[globalID][`state${convertMapIndex2State(mapIndex)}`] === 1) {
                    selectedGids.push(globalID);
                }
            }
        });
    }

    const source = new VectorSource({
        extent: extent,
        projection: projection,
        format: new GeoJSONFormat({
            dataProjection: projection,
            featureProjection: projection,
            geometryName: 'geometry'
        }),
        loader: async (extent, resolution, projection, success, failure) => {
            let data;
            // let url = `${config.apiUrl}/api/static/`;
            // if (layerid === 14) url += 'WaterRegion';
            // else if (layerid === 15) url += 'WaterArea';
            if (layerid === 14) data = initialWaterAreas.waterRegion;
            else if (layerid === 15) data = initialWaterAreas.waterArea;

            // const response = await fetch(url, {
            //     method: 'get',
            //     headers: {
            //         'Accept': 'application/json',
            //         'Content-Type': 'application/json',
            //         'Authorization': 'Bearer ' + auth.getAuthToken
            //     }
            // });
            // const data = await response.json();
            // if (data.error) return;
            if (data === undefined) return;
            // console.log('data', data);
            let features = source.getFormat().readFeatures(data);
            features.forEach(f => {
                f.set('disabled', false);
            });
            let disabledFeatures = [];
            let selectedFeatures = [];
            if (filterById) {
                // console.log('features', features);
                // console.log('validGids', validGids);
                disabledFeatures = features.filter(f => validGids.indexOf(f.get('globalID')) < 0);
                selectedFeatures = features.filter(f => selectedGids.indexOf(f.get('globalID')) >= 0);
                features = features.filter(f => validGids.indexOf(f.get('globalID')) >= 0);
            }
            if (disabledFeatures.length > 0) {
                // console.log('disabled', disabledFeatures);
                disabledFeatures.forEach(f => {
                    f.set('disabled', true);
                    features.push(f);
                });
            }
            if (selectedFeatures.length > 0) {
                // console.log('selected', selectedFeatures);
                selectedFeatures.forEach(f => {
                    f.set('selected', true);
                    if (features.indexOf(f) < 0) features.push(f);
                });
            }
            if (!vectorFeatures[name]) vectorFeatures[name] = [];
            features.forEach((feature) => {
                feature.set('_layerName', name);
                if (!waterLayerName && setWaterLayerNameCallback) {
                    waterLayerName = feature.get('Name')
                        ? 'Name'
                        : feature.get('vannomraadenavn')
                            ? 'vannomraadenavn'
                            : feature.get('vannregionnavn')
                                ? 'vannregionnavn'
                                : undefined;
                    setWaterLayerNameCallback(waterLayerName);
                }
                vectorFeatures[name].push(feature);
            });
            // const test = [];
            // features.forEach((f) => {
            //     test.push(f.getProperties());
            // });
            // console.log('test', test);
            source.addFeatures(features);
            success(features);
        }
    });

    const layer = new VectorLayer({
        name: name,
        opacity: 1,
        renderMode: 'vector',
        source: source,
        style: (feature, resolution) => styleFunction(feature, resolution, mapIndex),
        visible: true,
        zIndex: 2
    });

    return layer;
}

const createWaterSelectedLayer = async (name, projection) => {

    const style = await createWaterIntersectionStyle();

    const source = new VectorSource({
        extent: extent,
        projection: projection,
        format: new GeoJSONFormat({
            dataProjection: projection,
            featureProjection: projection,
            geometryName: 'geometry'
        }),
    });

    const layer = new VectorLayer({
        name: name,
        opacity: 1,
        renderMode: 'vector',
        source: source,
        style: style,
        visible: true,
        zIndex: 4
    });

    return layer;
}

// const createWaterLayer_deprecated = (name, layerid, projection, waterLayerName, setWaterLayerNameCallback) => {
//     // const vannUrl = 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/';
//     // const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Mapservices/Elspot/MapServer/';
//     // layerid = '0';

//     setColors();

//     const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Vanndirektiv/MapServer/';
//     // layerid = 14; // Vannregion
//     // layerid = 15; // Vannomraade

//     const props = {};

//     const source = new VectorTileSource({
//         extent: extent,
//         projection: projection,
//         format: new GeoJSONFormat({
//             dataProjection: projection,
//             featureProjection: projection,
//             geometryName: 'geometry'
//         }),
//         url: `${vannUrl}?x={x}&y={y}&z={z}`,
//         tileGrid: wmtsTileGrid(1, `EPSG:${config.mapEpsgCode}`, projection, Math.floor(mapZoom)),
//         tileLoadFunction: async (tile, tileurl) => {
//             let url = vannUrl;
//             url += layerid;
//             url += '/query';
//             url += '?where=';
//             url += '&text=';
//             url += '&objectIds=';
//             url += '&time=';
//             url += `&geometry=${tile.extent.join(',')}`;
//             url += '&geometryType=esriGeometryEnvelope';
//             url += `&inSR=${config.mapEpsgCode}`;
//             url += '&spatialRel=esriSpatialRelIntersects';
//             url += '&outFields=*';
//             url += '&relationParam=';
//             url += '&outFields=';
//             url += '&returnGeometry=true';
//             url += '&returnTrueCurves=true';
//             url += '&maxAllowableOffset=';
//             url += '&geometryPrecision=';
//             url += `&outSR=${config.mapEpsgCode}`;
//             url += '&returnIdsOnly=false';
//             url += '&returnCountOnly=false';
//             url += '&orderByFields=';
//             url += '&groupByFieldsForStatistics=';
//             url += '&outStatistics=';
//             url += '&returnZ=false';
//             url += '&returnM=false';
//             url += '&gdbVersion=';
//             url += '&returnDistinctValues=false';
//             url += '&resultOffset=';
//             url += '&resultRecordCount=';
//             url += '&queryByDistance=';
//             url += '&returnExtentsOnly=true';
//             url += '&datumTransformation=';
//             url += '&parameterValues=';
//             url += '&rangeValues=';
//             url += '&f=geojson';
//             const response = await fetch(url);
//             const data = await response.json();
//             if (data.error) return;
//             const format = tile.getFormat();
//             const features = format.readFeatures(data);
//             if (!vectorFeatures[name]) vectorFeatures[name] = [];
//             features.forEach((feature) => {
//                 feature.set('_layerName', name);
//                 if (!waterLayerName && setWaterLayerNameCallback) {
//                     waterLayerName = feature.get('Name')
//                         ? 'Name'
//                         : feature.get('vannomraadenavn')
//                             ? 'vannomraadenavn'
//                             : feature.get('vannregionnavn')
//                                 ? 'vannregionnavn'
//                                 : undefined;
//                     // console.log('setWaterLayerNameCallback', waterLayerName);
//                     setWaterLayerNameCallback(waterLayerName);
//                 }
//                 // // console.log('feature', feature.getProperties());
//                 // if (!props['vannregionID']) props['vannregionID'] = {};
//                 // if (!props['vannregionkoordinatorID']) props['vannregionkoordinatorID'] = {};
                
//                 // if (props['vannregionID'][feature.get('vannregionID')]) {
//                 //     props['vannregionID'][feature.get('vannregionID')]++;
//                 //     props['vannregionkoordinatorID'][feature.get('vannregionkoordinatorID')]++;
//                 // } else {
//                 //     props['vannregionID'][feature.get('vannregionID')] = 1;
//                 //     props['vannregionkoordinatorID'][feature.get('vannregionkoordinatorID')] = 1;
//                 // }
//                 // console.log('props', props);
//                 vectorFeatures[name].push(feature);
//             });
//             tile.setFeatures(features);
//         },
//         crossOrigin: 'anonymous'
//     });
//     const layer = new VectorTileLayer({
//         name: name,
//         opacity: 1,
//         renderMode: 'vector',
//         source: source,
//         style: styleFunction,
//         visible: true,
//         zIndex: 2
//     });

//     return layer;
// }

const reDrawWaterLayer = (mapObject, mapIndex, isWaterArea, initialWaterAreas, assessmentArea, setLastIsWaterArea, setPointerMoveForWaterLayer, setWaterLayerName) => {
    let waterLayer = mapObject.getLayers().getArray().filter(layer => layer.get('name') === 'Vatn')[0];
    if (waterLayer) {
        waterLayer.getSource().clear();
        waterLayer.setSource(undefined);
        mapObject.removeLayer(waterLayer);
        waterLayer = undefined;
    }

    const setWaterLayerNameCallback = (name) => {
        // console.log('setPointerMoveForWaterLayer-redraw', name);
        setWaterLayerName(name);
        setTimeout(() => {
            setPointerMoveForWaterLayer(mapObject, name);
        }, 500);
    };

    const projection = new Projection({
        code: `EPSG:${config.mapEpsgCode}`,
        extent: extent,
        units: 'm'
    });

    setLastIsWaterArea(isWaterArea);

    mapObject.addLayer(createWaterLayer('Vatn', mapIndex, isWaterArea, initialWaterAreas, projection, undefined, assessmentArea, setWaterLayerNameCallback));
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

const wmtsTileGrid = (numZoomLevels, matrixSet, projection, startLevel) => {
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
}

const createPopupElement = (isStatic, index) => {
    const contentElement = document.createElement('div');
    contentElement.className = `ol-popup-content ol-popup-content-${index}`;
    const element = document.createElement('div');
    element.className = `ol-popup ol-popup-${index} ${isStatic ? 'ol-popup-static' : 'ol-popup-anchor'}`;
    element.appendChild(contentElement);
    return element;
}

const mapOlFunc = {
    convertMapIndex2State: convertMapIndex2State,
    createButton: createButton,
    createPopupElement: createPopupElement,
    createStyle: createStyle,
    createWaterLayer: createWaterLayer,
    createWaterSelectedLayer: createWaterSelectedLayer,
    extent: extent,
    hoverStyleFunction: hoverStyleFunction,
    numZoomLevels: numZoomLevels,
    reDrawWaterLayer: reDrawWaterLayer,
    styleFunction: styleFunction,
    vectorFeatures: vectorFeatures,
    wmtsTileGrid: wmtsTileGrid
};
export default mapOlFunc;
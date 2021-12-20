import { GeoJSON as GeoJSONFormat } from 'ol/format';
import { Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { Projection } from 'ol/proj';
import { Vector as VectorSource, VectorTile as VectorTileSource, WMTS as WmtsSource } from 'ol/source';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import auth from '../authService'
import config from '../../config';

let defaultStyles;
let hoverStyles;
let waterLayerName;

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

const createTextStyleFunction = (feature) => {
    return new Text({
        text: feature.get(waterLayerName) ? feature.get(waterLayerName) : undefined
    });
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
    defaultStyle.setText(createTextStyleFunction(feature));
    return [defaultStyle];
};

const createWaterLayer = (mapObject, name, layerid, projection, waterLayerName, setWaterLayerNameCallback) => {
    // const vannUrl = 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/';
    // const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Mapservices/Elspot/MapServer/';
    // layerid = '0';

    setColors();

    const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Vanndirektiv/MapServer/';
    // layerid = 14; // Vannregion
    // layerid = 15; // Vannomraade

    const props = {};

    const source = new VectorSource({
        extent: extent,
        projection: projection,
        format: new GeoJSONFormat({
            dataProjection: projection,
            featureProjection: projection,
            geometryName: 'geometry'
        }),
        url: `${vannUrl}?x={x}&y={y}&z={z}`,
        loader: async (extent, resolution, projection, success, failure) => {
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
            // console.log('data', data);
            var features = source.getFormat().readFeatures(data);
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
            source.addFeatures(features);
            success(features);
        }
    });

    const layer = new VectorLayer({
        name: name,
        opacity: 1,
        renderMode: 'vector',
        source: source,
        style: styleFunction,
        visible: true,
        zIndex: 2
    });

    return layer;
}

const createWaterLayer_deprecated = (name, layerid, projection, waterLayerName, setWaterLayerNameCallback) => {
    // const vannUrl = 'https://vann-nett.no/arcgis/rest/services/WFD/AdministrativeOmraader/MapServer/';
    // const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Mapservices/Elspot/MapServer/';
    // layerid = '0';

    setColors();

    const vannUrl = 'https://nve.geodataonline.no/arcgis/rest/services/Vanndirektiv/MapServer/';
    // layerid = 14; // Vannregion
    // layerid = 15; // Vannomraade

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
                    waterLayerName = feature.get('Name')
                        ? 'Name'
                        : feature.get('vannomraadenavn')
                            ? 'vannomraadenavn'
                            : feature.get('vannregionnavn')
                                ? 'vannregionnavn'
                                : undefined;
                    // console.log('setWaterLayerNameCallback', waterLayerName);
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
        visible: true,
        zIndex: 2
    });

    return layer;
}

const reDrawWaterLayer = (mapObject, showRegion, setLastShowRegion, setPointerMoveForWaterLayer, setWaterLayerName) => {
    const waterLayers = mapObject.getLayers().getArray().filter(layer => layer.get('name') === 'Vatn');

    waterLayers.forEach(layer => {
        // console.log('removes', layer);
        mapObject.removeLayer(layer);
    });

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

    setLastShowRegion(showRegion);

    mapObject.addLayer(createWaterLayer(mapObject, 'Vatn', showRegion ? 14 : 15, projection, undefined, setWaterLayerNameCallback));
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

const mapOlFunc = {
    createButton: createButton,
    createStyle: createStyle,
    createWaterLayer: createWaterLayer,
    extent: extent,
    hoverStyleFunction: hoverStyleFunction,
    reDrawWaterLayer: reDrawWaterLayer,
    styleFunction: styleFunction,
    vectorFeatures: vectorFeatures
};
export default mapOlFunc;
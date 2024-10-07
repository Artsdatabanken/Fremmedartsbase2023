import React, { useState } from "react";
import * as RL from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

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

var redrawEveryTime = 0;

const Kart = ({
    children,
    onAddPoint,
    onEdit,
    style,
    mapBounds,
    geojson,
    onClickPoint
}) => {
    const [isEditing, setIsEditing] = useState();
    function createMarker(latlng, onClickPoint) {
        return L.circleMarker(latlng).on("click", e => {
            L.DomEvent.stopPropagation(e);
            onClickPoint(latlng);
        });
    }

    function handlePolygonDrawn(e) {
        setIsEditing(false);
        update(e.layer);
        e.layer._map.removeLayer(e.layer);
    }

    function handleEdit(e) {
        setIsEditing(true);
    }

    function update(layer) {
        const selection = JSON.stringify(layer.toGeoJSON());
        onEdit(selection);
    }

    function handleAddPoint(e) {
        if (isEditing) return;
        onAddPoint(e);
    }

    redrawEveryTime += 1;
    return (
        <RL.Map
            zoom={5}
            minZoom={4.5}
            maxBounds={[
                [50, -18],
                [90, 45]
            ]}
            bounds={mapBounds}
            animate
            scrollWheelZoom={true}
            onClick={handleAddPoint}
            attributionControl={false}
        >
            <RL.TileLayer url="//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png" />
            <RL.TileLayer
                url={
                    "//opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}"
                }
                attribution="&copy; <a href='https://statkart.no'>Kartverket</a>"
            />
            <RL.GeoJSON
                key={redrawEveryTime}
                data={geojson}
                interactive={false}
                pointToLayer={(f, l) => createMarker(l, onClickPoint)}
                style={featureData =>
                    style[featureData.source] || style[featureData.category]
                }
            />
            <RL.FeatureGroup className="x" style={{ marginLeft: 0 }}>
                {/* <EditControl
          onCreated={e => handlePolygonDrawn(e)}
          onDrawStart={e => handleEdit(e)}
          draw={selectionDrawingOptions}
        /> */}
            </RL.FeatureGroup>
            {children}
        </RL.Map>
    );
};

export default Kart;

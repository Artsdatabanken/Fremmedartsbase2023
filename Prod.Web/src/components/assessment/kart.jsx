import {observer} from 'mobx-react';
import React from 'react'
import * as RL from 'react-leaflet'
import * as L from 'leaflet'
import '../../../node_modules/leaflet/dist/leaflet.css'
import '../../../node_modules/leaflet-draw/dist/leaflet.draw.css'
import config from '../../config'
@observer
export default class Kart extends React.Component {
    constructor() {
        super()
        this.key = 1
    }

    render() {
        const selectionDrawingOptions = {
            position: "topright",
            marker: false,
            rectangle: false,
            polyline: false,
            circle: false,
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#af0000',
                    message: 'Området kan ikke ha kryssende linjer..' // Message that will show when intersect
                },
                showArea: false,
                shapeOptions: {
                    clickable: false,
                    color: '#0000ff',
                    weight: 1,
                }
            },
        }
        const style = this.props.style
//                 <RL.TileLayer url='//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'/>

        return (
            <RL.Map zoom={5} minZoom={3}
                    maxBounds={[[-90, -180], [90, 180]]}
                    bounds={[[56, 4.3], [69, 31]]}
                    animate
        onresize={(e) => this.handleResize(e)}>

                <RL.TileLayer url='//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png' />
                <RL.WMSTileLayer
                    url={config.overlayMapUrl}
                    format='image/png'
                    transparent
                    version="1.1"
                    attribution="" />
                <RL.GeoJSON key={this.key++} data={(this.props.geojson)}
                            pointToLayer={(f,l) => Kart.createMarker(f,l)}
                            style={(featureData) => {
                                return style[featureData.category]
                            }}
                />
                <RL.FeatureGroup>
                    {/* <EditControl
                        onCreated={(e) => this.handlePolygonDrawn(e)}
                        draw={selectionDrawingOptions} /> */}
                </RL.FeatureGroup>
            </RL.Map>
        )
    }

    handleResize(e) {
//        debugger
    }

    /*
     {selection ? <RL.GeoJson data={JSON.parse(selection)} /> : null}

     <RL.WMSTileLayer
     url="http://wms.geonorge.no/skwms1/wms.topo2/TI_B3AE06DDB?service=wms&version=1.1.1&SRS=EPSG:32633&REQUEST=GetMap&BBOX=-160401,6725187,446653,7153647&WIDTH=724&HEIGHT=511&FORMAT=image/png&TRANSPARENT=TRUE&layers=Hoydelag,Arealdekkeflate,Fjellskygge,Vannflate,Vannkontur,Elver,Flomlop,Hoydekurver,Bygninger,AdministrativeGrenser,Skytefeltgrense,Verneomradegrense,Veger,fkb_samferdsel,Jernbane,Ferger,Eiendom,fkb_naturinfo,Anleggslinjer,Hoydepunkt,Jernbanestasjon,Vegbom,Turisthytte,Anleggspunkter,Bygningspunkter,Arealdekkepunkter,Tettsted,Tekst&Styles="
     layers='topo2'
     format='image/png'
     transparent={true}
     version="1.0"
     attribution="Kartverket" />


     <RL.WMSTileLayer url="http://opencache.statkart.no/gatekeeper/gk/gk.open" layers='topo2'
     format='image/png'
     transparent={true}
     version="1.0"
     attribution="Kartverket" />

     <RL.TileLayer url={'//opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norges_grunnkart&zoom={z}&x={x}&y={y}'}
     attribution="&copy; <a href='https://statkart.no'>Kartverket</a>" />

     <RL.WMSTileLayer url="http://opencache.statkart.no/gatekeeper/gk/gk.open" layers='norges_grunnkart'
     format='image/png'
     transparent={true}
     version="1.0"
     attribution="Kartverket" />
     */

    static createMarker(feature, latlng) {
        return L.circleMarker(latlng, {})
    }

    handlePolygonDrawn(e) {
        this.update(e.layer)
        e.layer._map.removeLayer(e.layer)
    }

    update(layer) {
        const selection = JSON.stringify(layer.toGeoJSON())
        this.props.onEdit(selection)
    }
}

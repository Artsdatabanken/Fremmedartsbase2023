import React from 'react'
import {observer} from 'mobx-react'
import {toJS, observable} from 'mobx'
import Kart from './kart'
import Artskartparametre from './Artskartparametre'
import {Button, Modal} from 'react-bootstrap';
// import {loadDataFromUrl} from '../stores/apiService'
import Loading from './Loading'
import config from '../../config'


function loadDataFromUrl() {alert("loadDataFromUrl not implemented")}

@observer
export default class Artskart extends React.Component {
    @observable visUtvalgsparametre = false
    kriterier = observable({
        taxonId: 0,
        scientificnameId: 0,
        observationFromYear: 0,
        observationYear: 0,
        selectionGeometry: 0,
        utvalgsparametre: {}
    })

    resultat = observable({
        loadProgress: 0,
        observations: {
            "type": "FeatureCollection",
            "features": []
        },
        speciesCount: 0,
        existenceAreaCount: 0,
        existenceArea: 0,
        spreadArea: 0
    })

    constructor(props) {
        super(props)
        this.update(props)
    }

    componentWillUpdate(nextProps) {
        this.update(nextProps)
    }

    update(props) {
        this.kriterier.taxonId = props.taxonId
        this.kriterier.scientificnameId = props.scientificnameId
        this.kriterier.observationFromYear = props.observationFromYear
        this.kriterier.observationYear = props.observationYear
        this.kriterier.utvalgsparametre = props.utvalgsparametre
        this.kriterier.observationFromYear = props.observationFromYear
        this.kriterier.observationYear = props.observationYear
        this.getInfoFromArtskart(this.kriterier, this.resultat)
    }

    render() {
        const isLoading = this.resultat.loadProgress >= 0 && this.resultat.loadProgress < 3
        const props = this.props
        let title = `Forekomstareal fra Artskart (${this.kriterier.observationFromYear} - ${this.kriterier.observationYear})`
        if (this.resultat.existenceArea)
            title = `${title}: ${this.resultat.existenceArea} km² (basert på ${this.resultat.speciesCount} observasjoner)`

        const mapStyle = {
            'inside': {
                radius: 4,
                fillColor: "#ff0000",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            },
            'outside': {
                radius: 4,
                fillColor: "#ffa0a0",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5
            },
            'utbredelsesomraade': {
                fillColor: "#888",
                color: "#000",
                weight: 1,
                opacity: 0.7,
                fillOpacity: 0.4
            }
        }

        return (
            <Modal
                onHide={() => this.props.onCancel()}
                show
                bsSize="large"
                aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <Kart
                            geojson={toJS(this.resultat.observations)}
                            onEdit={(e) => this.oppdaterPolygon(e)}
                            style={mapStyle} /> {isLoading && <div
                            style={{
                            position: "absolute",
                            top: '50%',
                            left: '50%',
                            width: '80%'
                        }}>
                            <Loading />
                        </div>}

                        {this.visUtvalgsparametre && <Artskartparametre
                            utvalg={props.utvalgsparametre}
                            fabModel={props.fabModel}
                            onOk={() => (this.visUtvalgsparametre = false)} />
}
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => (this.visUtvalgsparametre = !this.visUtvalgsparametre)}>
                        Utvalgsparametre
                    </Button>
                    <Button
                        disabled={isLoading || this.context.readonly}
                        onClick={() => this.props.onSave(this.resultat)}>Overfør</Button>
                    <Button onClick={() => this.props.onCancel()}>Avbryt</Button>
                </Modal.Footer>
            </Modal>
        )
    }
    oppdaterPolygon(selectionGeometry) {
        this.kriterier.selectionGeometry = selectionGeometry
        this.getInfoFromArtskart(this.kriterier, this.resultat)
    }

    getInfoFromArtskart(kriterier, resultat) { //const apibase = '//localhost:52254/api/listhelper/'
        //const apibase = ((window.location.href.indexOf('lokalapi') > -1) ? 'http://localhost:7588/' : 'https://invasivespeciesservice.artdata.slu.se/') + 'listhelper/'
        const apibase = config.mapApiUrl // 'https://invasivespeciesservice.artdata.slu.se/listhelper/'
        let queryparams = `&fromYear=${kriterier.observationFromYear}&toYear=${kriterier.observationYear}&fromMonth=${kriterier.utvalgsparametre.fromMonth}&toMonth=${kriterier.utvalgsparametre.toMonth}&type=${kriterier.includeObjects == kriterier.includeObservations
            ? 'all'
            : (kriterier.includeObjects
                ? 'specimen'
                : 'observations')}&region=${kriterier.includeNorge == kriterier.includeSvalbard
                ? 'all'
                : (kriterier.includeNorge
                    ? 'fastland'
                    : 'svalbard')}`
        queryparams = `${queryparams}&scientificNameId=${kriterier.scientificnameId}`
        if (kriterier.selectionGeometry)
            queryparams = `${queryparams}&geojsonPolygon=${JSON.parse(kriterier.selectionGeometry).geometry.coordinates}`

        const newurl = `${apibase + kriterier.taxonId}/observations?${queryparams}`
        const newAreasUrl = `${apibase + kriterier.taxonId}/areadata?${queryparams}`
        const newCountyListUrl = `${apibase + kriterier.taxonId}/countylist?${queryparams}`

        if (resultat.mapurl == newurl) {
            return
        }
        resultat.loadProgress = 0

        resultat.mapurl = newurl
        resultat.observations = {
            "type": "FeatureCollection",
            "features": []
        }

        loadDataFromUrl(newurl, data => {
            resultat.loadProgress += 1
            resultat.observations = data
        })

        loadDataFromUrl(newAreasUrl, data => {
            resultat.loadProgress += 1
            resultat.speciesCount = data.NumberOfRecords
            resultat.existenceAreaCount = data.AreaOfOccupancy / 4 // km^2
            resultat.existenceArea = data.AreaOfOccupancy // antall 2x2 km^2 ruter
            resultat.spreadArea = data.AreaExtentOfOccurrence
        })

        loadDataFromUrl(newCountyListUrl, data => {
            resultat.loadProgress += 1
            resultat.regionalPresence = data
        })
    }
}
Artskart.contextTypes = {
    readonly: React.PropTypes.bool
}
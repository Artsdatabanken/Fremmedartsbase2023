import React from 'react'
import {observer} from 'mobx-react'
import {observable} from 'mobx'
import {Button} from 'react-bootstrap'
import * as Xcomp from '../observableComponents'
import Fylkesliste from './Fylkesliste'
import Artskart from '../Artskart'
import Spredningskart from './Spredningskart'

@observer
export default class EkspandertSpredningsrad extends React.Component {
    @observable visArtskart = false

    render() {
        const {detaljer, fabModel} = this.props
        // const labels = fabModel.kodeLabels.DistributionHistory
        // const detaljer = this.props.detaljer
        const artskartModel = fabModel.artskartModel
        return (
            <tr
                className="table-active"
                style={{
                borderTopColor: "transparent",
                boxShadow: "rgba(0, 0, 0, 0.0470588) 6px 6px 4px 0px"
            }}>
                <td colSpan="11">
                    <table style={{width:"100%"}}>
                        <tbody>
                            <tr>
                                <td colSpan="3">
                                    <EkspandertSpredningsradDetaljer
                                        { ...this.props }
                                        onShowArtskart={() => {
                                        this.visArtskart = true;
                                        return null
                                    }}/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                {this.visArtskart && <Artskart
                    fabModel={this.props.fabModel}
                    onSave={(resultat) => this.handleSave(resultat)}
                    onCancel={() => this.handleCancel()}
                    id={this.props.id}
                    key={this.props.id}
                    taxonId={this.props.taxonId}
                    scientificnameId={this.props.scientificNameId}
                    observationFromYear={detaljer.ObservationFromYear}
                    observationYear={detaljer.ObservationYear}
                    SelectionGeometry={detaljer.SelectionGeometry}
                    utvalgsparametre={artskartModel.utvalgsparametre}/>}
            </tr>
        )
    }

    handleCancel() {
        this.visArtskart = false
    }

    handleSave(artskartRespons) {
        this.visArtskart = false
        const artskartModel = this.props.fabModel.artskartModel
        const detaljer = this.props.detaljer
        detaljer.Observations = artskartRespons.observations
        detaljer.ExistenceArea = artskartRespons.existenceArea
        detaljer.SpeciesCount = artskartRespons.speciesCount
        detaljer.SpreadArea = artskartRespons.spreadArea
        detaljer.Regions = artskartModel.mapRegionalPresenceFromArtskart(artskartRespons.regionalPresence)
        detaljer.RegionsAssumed = detaljer.Regions
        detaljer.regionalPresenceKnown = artskartModel.enhanceRegionalPresence(detaljer.Regions)
        detaljer.regionalPresenceAssumed = artskartModel.enhanceRegionalPresence(detaljer.RegionsAssumed)
    }
}

@observer export class EkspandertSpredningsradDetaljer extends React.Component {
    render() {
        const {fabModel, detaljer} = this.props
        const labels = fabModel.kodeLabels.DistributionHistory
        return (
            <table style={{
                width: "100%"
            }}>
                <tbody>
                    <tr>
                        <td
                            style={{
                            width: "33%"
                        }}>
                            <table
                                style={{
                                width: "100%"
                            }}
                                className="formtable">
                                <tbody>
                                    <tr>
                                        <td>{labels.historyFrom}</td>
                                        <td colSpan="2"><Xcomp.Number
                                            width="4.5em"
                                            observableValue={[detaljer, 'ObservationFromYear']}
                                            validate={(val) => val.toString().length > 0}
                                            integer
                                            />
                                        </td>
                                        <td
                                            colSpan="2"
                                            rowSpan="1"
                                            style={{
                                            verticalAlign: "center"
                                        }}>
                                            <Button
                                                bsStyle="primary"
                                                onClick={() => {
                                                this
                                                    .props
                                                    .onShowArtskart()
                                            }}>{labels.expandShowMap}
                                                <span className='fa fa-binoculars'/>
                                            </Button>
                                        </td>

                                    </tr>
                                    <tr>
                                        <td>{labels.historyTo}</td>
                                        <td colSpan="3">
                                            <Xcomp.Number
                                                width="4.5em"
                                                observableValue={[detaljer, 'ObservationYear']}
                                                validate={(val) => val.toString().length > 0}
                                                integer
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>{labels.historyLocation}</td>
                                        <td width="100%" colSpan="4"><Xcomp.String observableValue={[detaljer, 'Location']}/></td>
                                    </tr>
                                    <tr>
                                        <td>&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>&nbsp;</td>
                                        <td width="60em">
                                            <b>{labels.expandValue}</b>
                                        </td>
                                        <td>&nbsp;</td>
                                        <td width="60em">
                                            <b>{labels.expandDarkFigure}</b>
                                        </td>
                                        <td>&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>{labels.historyCount}</td>
                                        <td>
                                            <Xcomp.Number
                                                width="6em"
                                                integer
                                                observableValue={[detaljer, 'SpeciesCount']}/>
                                        </td>
                                        <td>&nbsp;*&nbsp;</td>
                                        <td><Xcomp.Number
                                            width="4em"
                                            integer
                                            observableValue={[detaljer, 'SpeciesCountDarkFigure']}/></td>
                                        <td>{detaljer.SpeciesCountCalculated && `= ${detaljer.SpeciesCountCalculated}`}</td>
                                    </tr>
                                    <tr>
                                        <td>{labels.historyAreaOccupancy}</td>
                                        <td><Xcomp.Number integer width="6em" observableValue={[detaljer, 'ExistenceArea']}/></td>
                                        <td>&nbsp;*&nbsp;</td>
                                        <td><Xcomp.Number
                                            width="4em"
                                            observableValue={[detaljer, 'ExistenceAreaCountDarkFigure']}/></td>
                                        <td>{detaljer.ExistenceAreaCalculated && `= ${detaljer.ExistenceAreaCalculated}`}&nbsp;km&#178;</td>
                                    </tr>
                                    <tr>
                                        <td>{labels.historyExtentOfOccurrence}</td>
                                        <td
                                            style={{
                                            whiteSpace: "nowrap"
                                        }}>
                                            <Xcomp.Number
                                                integer
                                                observableValue={[detaljer, 'SpreadArea']}
                                            />
                                        </td>
                                        <td colSpan="2">&nbsp;km&#178;</td>
                                    </tr>
                                    <tr>
                                        <td>&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>{labels.historyComment}</td>
                                        <td colSpan="4"><Xcomp.HtmlString observableValue={[detaljer, 'Comment']}/></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td width="5%"/>
                        <td>
                            <table
                                style={{
                                width: "100%"
                            }}>
                                <tbody>
                                    <tr>
                                        <td
                                            style={{
                                            width: "60%",
                                            position: "relative"
                                        }}>
                                            <h4
                                                style={{
                                                position: "absolute",
                                                top: "7px"
                                            }}>{labels.expandOccurrence}</h4>
                                            {this.props.fabModel.evaluationContext.map == 'norge' && <Spredningskart
                                                map={this.props.fabModel.evaluationContext.map}
                                                showLegend
                                                states={[
                                                {
                                                    key: 'none',
                                                    title: labels.distributionNone
                                                }, {
                                                    key: 'known',
                                                    title: labels.distributionKnown,
                                                    values: detaljer.regionalPresenceKnown
                                                }, {
                                                    key: 'assumed',
                                                    title: labels.distributionAssumed,
                                                    values: detaljer.regionalPresenceAssumed
                                                }
                                            ]}
                                                countyListLand={this.props.fabModel.artskartModel.koder.countyListLand}/>}
                                        </td>
                                        <td
                                            style={{
                                            width: "40%"
                                        }}>
                                            <Fylkesliste
                                            countyLabel={labels.distributionCounty}
                                                columns={[
                                                {
                                                    title: labels.distributionKnown,
                                                    values: detaljer.regionalPresenceKnown
                                                }, {
                                                    title: labels.distributionAssumed,
                                                    values: detaljer.regionalPresenceAssumed
                                                }
                                            ]}
                                                rows={fabModel
                                                .artskartModel
                                                .regionListe()}/></td>
                                    </tr>
                                </tbody >
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td
                            colSpan="4"
                            style={{
                            textAlign: "right"
                        }}>
                            <Button
                                onClick={() => this.copyToCurrentAndPotential(detaljer)}
                                bsStyle="primary">⇓ {labels.expandCopyTo} ⇓</Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
    copyToCurrentAndPotential(row) {
        const v = this.props.fabModel.vurdering
        EkspandertSpredningsradDetaljer.copyCheckmarks(row.regionalPresenceKnown, v.knownRegionalPresence)
        EkspandertSpredningsradDetaljer.copyCheckmarks(row.regionalPresenceAssumed, v.assumedRegionalPresence)
        EkspandertSpredningsradDetaljer.clearCheckmarks(v.potentialRegionalPresence)
        EkspandertSpredningsradDetaljer.copyCheckmarks(row.regionalPresenceKnown, v.potentialRegionalPresence)
        EkspandertSpredningsradDetaljer.copyCheckmarks(row.regionalPresenceAssumed, v.potentialRegionalPresence)
        v.CurrentIndividualCount = row.SpeciesCount
        v.CurrentIndividualCountMultiplier = row.SpeciesCountDarkFigure
        v.CurrentExistenceArea = row.ExistenceArea
        v.CurrentExistenceAreaMultiplier = row.ExistenceAreaCountDarkFigure
        v.CurrentSpreadArea = row.SpreadArea
    }
    static clearCheckmarks(dest) {
        for (const k in dest)
            dest[k] = false
    }
    static copyCheckmarks(src, dest) {
        for (const k in src)
            if (src[k])
                dest[k] = true
    }
}

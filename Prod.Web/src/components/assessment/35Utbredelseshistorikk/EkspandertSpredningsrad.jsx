import React from 'react'
import { observer } from 'mobx-react'
import { observable, makeObservable } from 'mobx';
// import * as Xcomp from '../observableComponents'
import Artskart from '../Artskart'
import Spredningskart from './Spredningskart'

class EkspandertSpredningsrad extends React.Component {
    visArtskart = false;

    constructor(props) {
        super(props);

        makeObservable(this, {
            visArtskart: observable
        });
    }

    render() {
        const { detaljer, appState, assessment, disabled } = this.props
        const artskartModel = assessment.artskartModel
        return (
            <tr
                className={disabled ? "table-disabled" : "table-active"}
                style={{
                    borderTopColor: "transparent",
                    boxShadow: "rgba(0, 0, 0, 0.0470588) 6px 6px 4px 0px"
                }}>
                <EkspandertSpredningsradDetaljer
                    {...this.props}
                    disabled={disabled}
                    onShowArtskart={() => {
                        this.visArtskart = true;
                        return null
                    }} />
                {this.visArtskart &&
                    <Artskart
                        appState={this.props.appState}
                        onSave={(resultat) => this.handleSave(resultat)}
                        onCancel={() => this.handleCancel()}
                        id={this.props.id}
                        key={this.props.id}
                        taxonId={this.props.taxonId}
                        scientificnameId={this.props.scientificNameId}
                        observationFromYear={detaljer.observationFromYear}
                        observationYear={detaljer.observationYear}
                        SelectionGeometry={detaljer.selectionGeometry}
                        utvalgsparametre={artskartModel.utvalgsparametre} />}
            </tr>
        )
    }

    handleCancel() {
        this.visArtskart = false
    }

    handleSave(artskartRespons) {
        this.visArtskart = false
        const artskartModel = this.props.appState.artskartModel
        const detaljer = this.props.detaljer
        detaljer.observations = artskartRespons.observations
        detaljer.existenceArea = artskartRespons.existenceArea
        detaljer.speciesCount = artskartRespons.speciesCount
        detaljer.spreadArea = artskartRespons.spreadArea
        detaljer.regions = artskartModel.mapRegionalPresenceFromArtskart(artskartRespons.regionalPresence)
        detaljer.regionsAssumed = detaljer.regions
        detaljer.regionalPresenceKnown = artskartModel.enhanceRegionalPresence(detaljer.regions)
        detaljer.regionalPresenceAssumed = artskartModel.enhanceRegionalPresence(detaljer.regionsAssumed)
    }
}

export default observer(EkspandertSpredningsrad);
export class EkspandertSpredningsradDetaljer extends React.Component {
    render() {
        const { appState, detaljer, assessment, disabled } = this.props
        const labels = appState.codeLabels.DistributionHistory
        return (

            <>
                <td />
                <td> {detaljer.observationFromYear}</td>
                <td> {detaljer.observationYear}</td>
                <td> {detaljer.location}</td>
                <td> {detaljer.speciesCount}</td>
                <td> {detaljer.existenceArea}</td>
                <td> {detaljer.spreadArea}</td>
                <td> {detaljer.comment}</td>
                <td>
                    <Spredningskart
                        map={this.props.appState.evaluationContexts.map}
                        showLegend
                        disabled={disabled}
                        width={"150px"}
                        appState={appState}
                        states={[
                            {
                                key: 'none',
                                title: labels.distributionNone
                            },
                            {
                                key: 'known',
                                title: labels.distributionKnown,
                                values: detaljer.regions
                            },
                            {
                                key: 'assumed',
                                title: labels.distributionAssumed,
                                values: detaljer.regionsAssumed
                            }
                        ]}
                        countyListLand={this.props.appState.koder.countyListLand}
                    />
                </td>
                <td>&nbsp;</td>
            </>
        )
    }
    copyToCurrentAndPotential(row) {
        const v = this.props.appState.vurdering
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

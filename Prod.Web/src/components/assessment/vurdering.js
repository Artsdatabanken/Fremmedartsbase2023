import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {observable} from 'mobx'
import Tabs from '../tabs'
// import Risikomatrise from './risikomatrise';
import BsModal from '../bootstrapModal'
import Vurdering30Artsinformasjon from './vurdering30Artsinformasjon'
import Vurdering40Naturtyper from './vurdering40Naturtyper'
import Vurdering50Risikovurdering from './vurdering50Risikovurdering'
// import VurderingOppdaterTaxonomi from './vurderingOppdaterTaxonomi'
// import VurderingReferanser from './vurderingReferanser'
// import VurderingReferanser from './assessmentReferences'
// import {user} from "../stores/userSession"
import LoadingHoc from '../LoadingHoc'
import AssessmentReferences from '../assessmentReferences'


@LoadingHoc('isThingsLoaded')
@observer
export default class Vurdering extends React.Component {
    render() {
        const {fabModel: {
                vurdering
            }, fabModel, viewModel} = this.props
        const {mainTabs, artsinformasjonTabs, risikovurderingTabs} = viewModel
        const labels = fabModel.kodeLabels
        const ra = vurdering.RiskAssessment
        const username = fabModel.ekspertgruppeRolle ? fabModel.ekspertgruppeRolle.userName : ""
        const showRiskHelper = true
        return (
            <div>
                <div>
                    <div style={{float: "right"}}>
                        <VurderingOppdaterTaxonomi fabModel={fabModel} />
                    </div>
                    <div>
                        <h1>
                            <span
                                style={{
                                fontFamily: "Times New Roman",
                                fontWeight: "500",
                                fontStyle: "italic",
                                color: "#808077"
                            }}>{vurdering.EvaluatedScientificName}</span>
                        </h1>
                        {vurdering.EvaluatedScientificNameAuthor
                            ? <p style={{color: "#bbb"}}>{vurdering.EvaluatedScientificNameAuthor}</p>
                            : null}
                    </div>
                </div>
                {this.isFinnished()
                ? <span style={{ color: 'red'}}>{labels.SelectAssessment.isCompletedWarning}</span>
                : this.isReadOnly()
                ? <span style={{ color: 'red'}}>{labels.SelectAssessment.isReadOnlyWarning}</span>
                : null}
                <Tabs tabData={mainTabs}/> {mainTabs.activeTab.id === 3
                    ? <Vurdering30Artsinformasjon
                            vurdering={vurdering}
                            viewModel={viewModel}
                            fabModel={fabModel}/>
                    : mainTabs.activeTab.id === 4
                        ? <Vurdering40Naturtyper
                                vurdering={vurdering}
                                viewModel={viewModel}
                                fabModel={fabModel}/>
                        : mainTabs.activeTab.id === 5
                            ? <Vurdering50Risikovurdering
                                    vurdering={vurdering}
                                    viewModel={viewModel}
                                    fabModel={fabModel}/>
                            : mainTabs.activeTab.id === 6
                                ? <AssessmentReferences vurdering={vurdering} viewModel={viewModel} codes={fabModel.koder} labels={fabModel.kodeLabels}/>
                                : <h1>Oooops?? main:{mainTabs.activeTab.id}
                                    ai:{artsinformasjonTabs.activeTab.id}
                                    rv:{risikovurderingTabs.activeTab.id}</h1>}
            </div>
        )
    }

    isFinnished() {
        const isfinnished = this.props.fabModel.vurdering.vurderingsStatus === "finnished"
        return isfinnished
    }

    isReadOnly() {
        // const isreadonly = this.props.fabModel.vurdering.LockedForEditByUser !== auth.userName
        const isreadonly = false
        return isreadonly || this.isFinnished()
    }

    getChildContext() {
        return {
            readonly: this.isReadOnly(),
            language: this.props.fabModel.language
            // isFinnished: this.isFinnished()
        }
    }

    static propTypes = {
        viewModel: PropTypes.object.isRequired,
        fabModel: PropTypes.object.isRequired
    }

    static childContextTypes = {
        readonly: PropTypes.bool,
        language: PropTypes.string
    }
}

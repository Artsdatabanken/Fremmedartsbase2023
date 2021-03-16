import React from 'react';
import {observer} from 'mobx-react';
import {computed, observable, autorun} from 'mobx';
import Tabs from '../tabs';
import * as Xcomp from '../observableComponents';
import Vurdering51Invasjonspotensiale from './vurdering51Invasjonspotensiale';
import Vurdering52Okologiskeffekt from './vurdering52Okologiskeffekt';
import Vurdering53GeografiskVariasjon from './vurdering53GeografiskVariasjon';
import Vurdering54Klimaeffekter from './vurdering54Klimaeffekter';
import Vurdering55Kriteriedokumentasjon from './vurdering55Kriteriedokumentasjon';

@observer
export default class Vurdering extends React.Component {
    // @observable showModal: false;

    constructor (props) {
        super()
    }
    

    render() {
        const {vurdering, fabModel, viewModel} = this.props;
        const {risikovurderingTabs } = viewModel;
        const riskAssessment = fabModel.activeRegionalRiskAssessment;
        const evaluationContext = vurdering.EvaluationContext
        const existenceArea35 = vurdering.CurrentExistenceAreaCalculated
        const kritDocInfo = {
            alienSpeciesCategory: vurdering.AlienSpeciesCategory || "AlienSpecie",
            limnic: vurdering.Limnic,
            terrestrial: vurdering.Terrestrial,
            marine: vurdering.Marine,
            brackishWater: vurdering.BrackishWater
        }
            
        return(
            <div>
                <Tabs tabData={risikovurderingTabs} />
                { risikovurderingTabs.activeTab.id === 1 ?
                <Vurdering51Invasjonspotensiale riskAssessment={riskAssessment}  viewModel={viewModel} fabModel={fabModel} existenceArea35={existenceArea35} />
                : risikovurderingTabs.activeTab.id === 2 ?
                <Vurdering52Okologiskeffekt riskAssessment={riskAssessment}  viewModel={viewModel} fabModel={fabModel} evaluationContext={evaluationContext}/>
                : risikovurderingTabs.activeTab.id === 3 ?
                <Vurdering53GeografiskVariasjon riskAssessment={riskAssessment}  viewModel={viewModel} fabModel={fabModel} />
                : risikovurderingTabs.activeTab.id === 4 ?
                <Vurdering54Klimaeffekter riskAssessment={riskAssessment}  viewModel={viewModel} fabModel={fabModel} />
                : risikovurderingTabs.activeTab.id === 5 ?
                <Vurdering55Kriteriedokumentasjon riskAssessment={riskAssessment}  viewModel={viewModel}  fabModel={fabModel} kritDocInfo={kritDocInfo} />
                : <h1>Oooops?? risktab:{risikovurderingTabs.activeTab.id}</h1>}
            </div>
        );
    }
}

Vurdering.propTypes = {
	viewModel: React.PropTypes.object.isRequired,
	fabModel: React.PropTypes.object.isRequired
}

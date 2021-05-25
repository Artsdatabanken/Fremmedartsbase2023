import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
import * as Xcomp from './observableComponents';


@inject("appState")
@observer
export default class Vurdering54Klimaeffekter extends React.Component {
    render() {
		const {appState:{assessment:{riskAssessment}}, appState} = this.props;
        const labels = appState.codeLabels
		const koder = appState.koder.Children
        // const {riskAssessment, viewModel, fabModel} = this.props;
        const climatelabel = (id) => koder.climateEffects.find(code => code.Value === id).Text

        return(
            <div>
   				{config.showPageHeaders ? <h3>Klimaeffekter</h3> : <br />}
                <Xcomp.StringEnum observableValue={[riskAssessment, 'climateEffectsInvationpotential']} codes={koder.yesNoUnknown} label={climatelabel("climateChangeAffectsInvationPotential")} mode="radio" />
                <br/>
                <Xcomp.StringEnum observableValue={[riskAssessment, 'climateEffectsEcoEffect']} codes={koder.yesNoUnknown} label={climatelabel("climateChangeAffectsEcoeffect")} mode="radio" />
                <br/>
                <Xcomp.HtmlString observableValue={[riskAssessment, 'climateEffectsDocumentation']} label={climatelabel("climateEffectsDocumentation")}/>
            </div>
        );
    }
}

// Vurdering54Klimaeffekter.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     riskAssessment: PropTypes.object.isRequired
// }

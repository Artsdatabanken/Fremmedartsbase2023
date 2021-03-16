import config from '../../config';
import React from 'react';
import {observer} from 'mobx-react';
import {observable, autorun} from 'mobx';
import * as Xcomp from './observableComponents';


@observer
export default class Vurdering54Klimaeffekter extends React.Component {
    render() {
        const {riskAssessment, viewModel, fabModel} = this.props;
        const climatelabel = (id) => fabModel.koder.climateEffects.find(code => code.Value === id).Text

        return(
            <div>
   				{config.showPageHeaders ? <h3>Klimaeffekter</h3> : <br />}
                <Xcomp.StringEnum observableValue={[riskAssessment, 'ClimateEffectsInvationpotential']} codes={fabModel.koder.yesNoUnknown} label={climatelabel("climateChangeAffectsInvationPotential")} mode="radio" />
                <br/>
                <Xcomp.StringEnum observableValue={[riskAssessment, 'ClimateEffectsEcoEffect']} codes={fabModel.koder.yesNoUnknown} label={climatelabel("climateChangeAffectsEcoeffect")} mode="radio" />
                <br/>
                <Xcomp.HtmlString observableValue={[riskAssessment, 'ClimateEffectsDocumentation']} label={climatelabel("climateEffectsDocumentation")}/>
            </div>
        );
    }
}

Vurdering54Klimaeffekter.propTypes = {
    viewModel: React.PropTypes.object.isRequired,
    riskAssessment: React.PropTypes.object.isRequired
}

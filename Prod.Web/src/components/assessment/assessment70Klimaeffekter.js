import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
import * as Xcomp from './observableComponents';


@inject("appState")
@observer
export default class Assessment70Klimaeffekter extends React.Component {
    render() {
		const {appState:{assessment:{riskAssessment}}, appState} = this.props;
        const labels = appState.codeLabels
		const koder = appState.koder
        // const {riskAssessment, viewModel, fabModel} = this.props;
        const climatelabel = (id) => koder.climateEffects.find(code => code.Value === id).Text

        return(
            <div>
   				{config.showPageHeaders ? <h3>Klimaeffekter</h3> : <br />}
                <h3>{climatelabel("heading")}</h3>
                <fieldset className="well">
                    {riskAssessment.riskLevelCode == "NK" ? 
                    <p>{climatelabel("categoryNK")}</p> : 
                    <div>
                    <p>{climatelabel("timePerspective")}</p>

                        <p>{climatelabel("partialCategoryInvasion")}</p>
                        <div className="climateChange">
                            <p><b dangerouslySetInnerHTML={{
                                                __html: climatelabel("climateChangeAffectsInvationPotential")}}></b></p>
                            <Xcomp.StringEnum observableValue={[riskAssessment, 'climateEffectsInvationpotential']} codes={koder.yesNo} mode="radio" />
                        </div>
                        <p>{climatelabel("partialCategoryEcoeffect")}</p>
                        <div className="climateChange">
                            <p><b dangerouslySetInnerHTML={{
                                            __html: climatelabel("climateChangeAffectsEcoeffect") }}></b></p>
                            <Xcomp.StringEnum observableValue={[riskAssessment, 'climateEffectsEcoEffect']} codes={koder.yesNo} mode="radio" />
                        </div>
                        <p>{climatelabel("climateEffectsDocumentation")}</p>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'climateEffectsDocumentation']} style={{minHeight: '150px'}} />
                    </div>
                }
                
                </fieldset>
            </div>
        );
    }
}

// Vurdering54Klimaeffekter.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     riskAssessment: PropTypes.object.isRequired
// }

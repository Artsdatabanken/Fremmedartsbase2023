import config from '../../config';
import React from 'react';
import {observer, inject} from 'mobx-react';
//import {observable, autorun} from 'mobx';
import * as Xcomp from './observableComponents';
nject("appState")
@observer
export default class Assessment70Klimaeffekter extends React.Component {
    render() {
		const {appState:{assessment:{riskAssessment}}, appState} = this.props;
        // const labels = appState.codeLabels
		const koder = appState.koder
        const climatelabel = (id) => koder.climateEffects.find(code => code.Value === id).Text
        const ecoEffect = riskAssessment.ecoEffectText
        const invasionPotential = riskAssessment.invationPotentialText
        return(
            <div>
   				{config.showPageHeaders 
                ? <h3>Klimaeffekter</h3> 
                : <br />}
                <fieldset className="well">
                    <h2>{climatelabel("heading")}</h2>
                    {riskAssessment.riskLevelCode == "NK"
                    ? <p>{climatelabel("categoryNK")}</p>
                    : <div>
                        <hr />
                        <p>{invasionPotential}</p>
                        <div>
                            <p dangerouslySetInnerHTML={{ __html: climatelabel("climateChangeAffectsInvationPotential")}}></p>
                            <Xcomp.StringEnum observableValue={[riskAssessment, 'climateEffectsInvationpotential']} codes={koder.yesNo} mode="radio" />
                        </div>
                        <hr/>
                        <p>{ecoEffect}</p>
                        <div>
                            <p dangerouslySetInnerHTML={{ __html: climatelabel("climateChangeAffectsEcoeffect") }}></p>
                            <Xcomp.StringEnum observableValue={[riskAssessment, 'climateEffectsEcoEffect']} codes={koder.yesNo} mode="radio" />
                        </div>
                        <p>{climatelabel("climateEffectsDocumentation")}</p>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'climateEffectsDocumentation']} style={{minHeight: '150px'}} />
                    </div>}
                </fieldset>
            </div>
        );
    }
}

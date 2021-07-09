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
                    <p>Arten er NK uten usikkerhet oppover, og utfylling av klimaeffekter er dermed ikke aktuelt.</p> : 
                    <div>
                    <p>Merk: Tidsperspektivet som lå til grunn for gjeldende delkategorier er vesentlig. 
                        Det skal være samsvar mellom tidsperspektivene det er svart ut fra under selve risikovurderingen, og tidsperspektivet her. </p>

                        <p>Delkategori invasjonspotensial: 2 (usikkerhet opp mot 3) Gjeldende kriterier: AB </p>
                        <Xcomp.StringEnum  className="climateChange" observableValue={[riskAssessment, 'climateEffectsInvationpotential']} codes={koder.yesNo} label={climatelabel("climateChangeAffectsInvationPotential")} mode="radio" />
                        <p>Delkategori økologisk effekt: 3 Gjeldende kriterier: FH</p>
                        <Xcomp.StringEnum  className="climateChange" observableValue={[riskAssessment, 'climateEffectsEcoEffect']} codes={koder.yesNo} label={climatelabel("climateChangeAffectsEcoeffect")} mode="radio" />
                        <br/>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'climateEffectsDocumentation']} style={{minHeight: '150px'}} label={climatelabel("climateEffectsDocumentation")}/>
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

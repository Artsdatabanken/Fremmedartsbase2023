import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
import * as Xcomp from './observableComponents';


@inject("appState")
@observer
export default class Vurdering53GeografiskVariasjon extends React.Component {
	render() {
		const {appState:{assessment:{riskAssessment}}, appState} = this.props;
        const labels = appState.codeLabels
		const koder = appState.koder.Children
		const geolabels = labels.geographicVariation
        
		return(
			<div>
				{config.showPageHeaders ? <h3>{geolabels.heading}</h3> : <br />}
				<Xcomp.MultiselectArray observableValue={[riskAssessment, "geographicalVariation"]} mode="check" codes={koder.geographicalVariation} labels={labels.General} />
				{riskAssessment.geographicalVariation.length > 0 ?
				<div>
				<label>{geolabels.extendedInformation}</label>
				<Xcomp.HtmlString observableValue={[riskAssessment, "geographicalVariationDocumentation"]} /> 
				</div>:
				null}
			</div>
        );
	}
}

// Vurdering53GeografiskVariasjon.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	riskAssessment: PropTypes.object.isRequired
// }

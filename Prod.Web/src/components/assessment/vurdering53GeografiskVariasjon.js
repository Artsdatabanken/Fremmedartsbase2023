import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import {observable, autorun} from 'mobx';
import * as Xcomp from './observableComponents';


@observer
export default class Vurdering53GeografiskVariasjon extends React.Component {
	render() {
		const {riskAssessment, viewModel, fabModel} = this.props;
		const labels = fabModel.kodeLabels.geographicVariation
        
		return(
			<div>
				{config.showPageHeaders ? <h3>{labels.heading}</h3> : <br />}
				<Xcomp.MultiselectArray observableValue={[riskAssessment, "GeographicalVariation"]} mode="check" codes={fabModel.koder.geographicalVariation} labels={fabModel.kodeLabels.General} />
				{riskAssessment.GeographicalVariation.length > 0 ?
				<div>
				<label>{labels.extendedInformation}</label>
				<Xcomp.HtmlString observableValue={[riskAssessment, "GeographicalVariationDocumentation"]} /> 
				</div>:
				null}
			</div>
        );
	}
}

Vurdering53GeografiskVariasjon.propTypes = {
	viewModel: PropTypes.object.isRequired,
	riskAssessment: PropTypes.object.isRequired
}

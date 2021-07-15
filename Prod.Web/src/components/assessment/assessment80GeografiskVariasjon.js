import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
import * as Xcomp from './observableComponents';


@inject("appState")
@observer
export default class Assessment80GeografiskVariasjon extends React.Component {
	render() {
		const {appState:{assessment}, appState:{assessment:{riskAssessment}}, appState} = this.props;
        const labels = appState.codeLabels
		const koder = appState.koder
		const geolabels = labels.geographicVariation
		
		
		if (riskAssessment.riskLevelCode == "NK" || riskAssessment.riskLevelCode == "LO") {
			riskAssessment.possibleLowerCategory = "no";
		} 
        
		return(
			<div>
				{config.showPageHeaders ? <h3>{geolabels.heading}</h3> : <br />}
				<fieldset className="well">
					<p dangerouslySetInnerHTML={{ __html: labels.geographicVariation.possibleLowerCategory }}></p>
					<Xcomp.StringEnum observableValue={[riskAssessment, "possibleLowerCategory"]} disabled={riskAssessment.riskLevelCode == "NK" || riskAssessment.riskLevelCode == "LO"} mode="radio" codes={koder.yesNo}/>
					{(riskAssessment.riskLevelCode == "NK" || riskAssessment.riskLevelCode == "LO") &&
						<p>{labels.geographicVariation.notValid }</p> }
					
					{riskAssessment.possibleLowerCategory == "yes" ? 
					<><p>{labels.geographicVariation.reasonForGeographicalVariation}</p>
						{assessment.marine ? <Xcomp.MultiselectArray className="geoVar" observableValue={[riskAssessment, "geographicalVariation"]} mode="check" 
						codes={koder.geographicalVariationMarine} 
					/> :

					<Xcomp.MultiselectArray className="geoVar" observableValue={[riskAssessment, "geographicalVariation"]} mode="check" 
						codes={koder.geographicalVariation} 
					/>
				
					}
					{riskAssessment.geographicalVariation.length > 0 ?
					<div className="geoVarInput">
					{/*<label>{geolabels.extendedInformation}</label>*/}
					<Xcomp.HtmlString  observableValue={[riskAssessment, "geographicalVariationDocumentation"]} /> 
					</div>:
					null}</> : null
					}
					
				</fieldset>
			</div>
        );
	}
}

// Vurdering53GeografiskVariasjon.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	riskAssessment: PropTypes.object.isRequired
// }

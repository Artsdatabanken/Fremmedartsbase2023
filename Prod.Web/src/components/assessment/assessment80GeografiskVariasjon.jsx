import config from '../../config';
import React from 'react';
import {observer, inject} from 'mobx-react';
import * as Xcomp from './observableComponents';
@inject("appState")
@observer
export default class Assessment80GeografiskVariasjon extends React.Component {
	render() {
		const {appState:{assessment}, appState:{assessment:{riskAssessment}}, appState} = this.props;
        const labels = appState.codeLabels
		const koder = appState.koder
		const geolabels = labels.geographicVariation
		return(
			<div>
				{config.showPageHeaders 
				? <h3>{geolabels.heading}</h3> 
				: <br />}
				<fieldset className="well">
					<h2>{geolabels.heading}</h2>
					{riskAssessment.riskLevelCode === "NK" 
					? <p dangerouslySetInnerHTML={{ __html: labels.geographicVariation.possibleLowerCategoryNK }}></p>
					: riskAssessment.riskLevelCode === "SE"
					? <p dangerouslySetInnerHTML={{ __html: labels.geographicVariation.possibleLowerCategorySE }}></p>
					: riskAssessment.riskLevelCode === "HI" 
					? <p dangerouslySetInnerHTML={{ __html: labels.geographicVariation.possibleLowerCategoryHI }}></p>
					: riskAssessment.riskLevelCode === "PH"
					? <p dangerouslySetInnerHTML={{ __html: labels.geographicVariation.possibleLowerCategoryPH }}></p>
					: riskAssessment.riskLevelCode === "LO"
					? <p dangerouslySetInnerHTML={{ __html: labels.geographicVariation.possibleLowerCategoryLO }}></p>
					: null}
					<Xcomp.StringEnum 
						observableValue={[riskAssessment, "possibleLowerCategory"]} 
						disabled={riskAssessment.riskLevelCode === "NK"} 
						mode="radio" 
						codes={koder.yesNo}/>
					{(riskAssessment.riskLevelCode == "NK") 
					? <p>{labels.geographicVariation.notValid}</p> 
					: null}
					{riskAssessment.possibleLowerCategory == "yes"
					? <>
					<p>{labels.geographicVariation.reasonForGeographicalVariation}</p>
					{assessment.marine 
					? <Xcomp.MultiselectArray 
						className="geoVar" 
						observableValue={[riskAssessment, "geographicalVariation"]} 
						mode="check" 
						codes={koder.geographicalVariationMarine} 
					/>
					: <Xcomp.MultiselectArray 
						className="geoVar" 
						observableValue={[riskAssessment, "geographicalVariation"]} 
						mode="check" 
						codes={koder.geographicalVariation} 
					/>}
					{riskAssessment.geographicalVariation.length > 0
					? <div className="geoVarInput">
						<Xcomp.HtmlString  observableValue={[riskAssessment, "geographicalVariationDocumentation"]} /> 
					</div>
					: null}
					</> 
					: null}
				</fieldset>
			</div>
        );
	}
}

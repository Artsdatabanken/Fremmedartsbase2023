import React from 'react';
import {observer, inject} from 'mobx-react';
import * as Xcomp from './observableComponents';
@inject("appState")
@observer
export default class Assessment10Horisontskanning extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment}, appState} = this.props;
    }

    render() {
        const {appState:{assessment}, appState} = this.props;
        const labels = appState.codeLabels
        const codes = appState.koder
        const disabled = appState.assessmentTypeFilter == "riskAssessment"
        return (
            <div>
            <div style={{marginBottom: '20px'}}>
               <div className="filters">
               <h2>{labels.SpeciesStatus.hskanning}
               {assessment.riskLevelCode == "NR" && 
               <button className="btn btn-primary"><a target="_blank" href={"#"
                        }>Se vurdering 2018</a></button>
                    }
                </h2>
                    <h4>{labels.SpeciesStatus.establishmentPotential}</h4>                    
                    <div className="scanning">
                        <p>{labels.SpeciesStatus.colonizationInformation}</p>
                        <Xcomp.StringEnum observableValue={[assessment, "horizonEstablismentPotential"]} disabled={disabled} mode="radio" codes={codes.HorizonEstablismentPotential}/>
                    </div>
                    <Xcomp.HtmlString observableValue={[assessment, 'horizonEstablismentPotentialDescription']} disabled={disabled} placeholder={labels.SpeciesStatus.furtherInformation} /> 
               </div>
               <div  className="filters">
                    <h4>{labels.SpeciesStatus.ecologicalEffect}</h4>
                    <div className="scanning">
                        <p>{labels.SpeciesStatus.knownNegativeEffects}</p>
                        <Xcomp.StringEnum observableValue={[assessment, "horizonEcologicalEffect"]} disabled={disabled} mode="radio" codes={codes.HorizonEcologicalEffect}/>
                    </div>
                    <Xcomp.HtmlString observableValue={[assessment, 'horizonEcologicalEffectDescription']} disabled={disabled} placeholder={labels.SpeciesStatus.furtherInformation}/>
               </div>
               
            </div>
            { (typeof assessment.horizonEstablismentPotential != "string" || typeof assessment.horizonEcologicalEffect != "string" )
            ? <fieldset className="well">
                <b>{labels.SpeciesStatus.answerEstablishmentQuestionReminder}</b>
            </fieldset>
            : assessment.horizonDoAssessment
            ? <fieldset className="well">
                <h3>{labels.SpeciesStatus.conclusion}</h3> 
                <p>{labels.SpeciesStatus.willBeAssessed}</p>
            </fieldset>
            : <fieldset className="well">
                <h3>{labels.SpeciesStatus.conclusion}</h3> 
                <p>{labels.SpeciesStatus.willNotBeAssessed}</p>
            </fieldset> }

        </div>
        );
    }
}

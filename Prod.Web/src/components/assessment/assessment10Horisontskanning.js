import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {autorun, extendObservable, observable} from 'mobx';
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
        return (
            <div>
            
            <div style={{marginBottom: '20px'}}>
           
        
               <div className="filters">
               <h2>{labels.SpeciesStatus.hskanning}
               <button className="btn btn-primary"><a target="_blank" href={"#"
                  //assessment.vurderingsår == '2015' ? assessment.importInfo.url2015 : assessment.importInfo.url2010
                        }>Se vurdering {assessment.vurderingsår}</a></button></h2>
                {/*((assessment.vurderingsår == '2015' && assessment.importInfo.url2015)||(assessment.vurderingsår == '2010' && assessment.importInfo.url2010)) &&
                   */}
              
                    <h4>{labels.SpeciesStatus.establishmentPotential}</h4>                    
                    <div className="scanning">
                        <p>{labels.SpeciesStatus.colonizationInformation}</p>
                            <Xcomp.StringEnum observableValue={[assessment, "horizonEstablismentPotential"]} mode="radio" codes={codes.HorizonEstablismentPotential}/>
                    </div>
                        <Xcomp.HtmlString observableValue={[assessment, 'horizonEstablismentPotentialDescription']} placeholder={labels.SpeciesStatus.furtherInformation} /> 
               </div>
               <div  className="filters">
                    <h4>{labels.SpeciesStatus.ecologicalEffect}</h4>
                    <div className="scanning">
                        <p>{labels.SpeciesStatus.knownNegativeEffects}</p>
                        <Xcomp.StringEnum observableValue={[assessment, "horizonEcologicalEffect"]} mode="radio" codes={codes.HorizonEcologicalEffect}/>
                    </div>
                    <Xcomp.HtmlString observableValue={[assessment, 'horizonEcologicalEffectDescription']} placeholder={labels.SpeciesStatus.furtherInformation}/>
               </div>
               
            </div>
            { (typeof assessment.horizonEstablismentPotential != "string" || typeof assessment.horizonEcologicalEffect != "string" )
                    ? <fieldset className="well"><b>{labels.SpeciesStatus.answerEstablishmentQuestionReminder}</b></fieldset>
                : appState.horizonDoAssessment
                ?    <fieldset className="well"><h3>{labels.SpeciesStatus.conclusion}</h3> <p>{labels.SpeciesStatus.willBeAssessed}</p></fieldset>
                :    <fieldset className="well"><h3>{labels.SpeciesStatus.conclusion}</h3> <p>{labels.SpeciesStatus.willNotBeAssessed}</p></fieldset> }

        </div>
        );
    }
}

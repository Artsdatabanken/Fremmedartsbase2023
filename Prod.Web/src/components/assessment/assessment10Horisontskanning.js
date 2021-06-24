import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {autorun, extendObservable, observable} from 'mobx';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'
// import BsModal from './bootstrapModal' import RedlistedNaturtypeSelector from
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
            <div style={{display: 'flex', marginBottom: '20px'}}>
               <div className="filters" style={{float: 'left', width: '50%'}}>
                    <h3>Etableringspotensial</h3>
                    
                    <div className="scanning">
                        <p>Hvor mange 2 km x 2 km-ruter kan arten kolonisere i løpet av en 10 års-periode basert på én introduksjon til norsk natur? 
                            (Anta at selve introduksjonen skjer i perioden f.o.m. i dag og inntil 40 år fram i tid).</p>

                            <Xcomp.StringEnum observableValue={[assessment, "horizonEstablismentPotential"]} mode="radio" codes={codes.HorizonEstablismentPotential}/>
                        </div>
                        <Xcomp.HtmlString observableValue={[assessment, 'horizonEstablismentPotentialDescription']} /> 
               </div>
               <div  className="filters" style={{float: 'right', width: '50%'}}>
                    <h3>Økologisk effekt</h3>
                    <div className="scanning">
                        <p>Er det noen kjente (fra utlandet) eller antatte (i Norge) negative økologiske effekter knyttet til arten?</p>

                        <Xcomp.StringEnum observableValue={[assessment, "horizonEcologicalEffect"]} mode="radio" codes={codes.HorizonEcologicalEffect}/>
                    </div>
                    <Xcomp.HtmlString observableValue={[assessment, 'horizonEcologicalEffectDescription']} />
               </div>
               
            </div>
            { (typeof assessment.horizonEstablismentPotential != "string" || typeof assessment.horizonEcologicalEffect != "string" )
                ? <p>Gjennomfør horisontskanning!</p>
                : appState.horizonDoAssessment
                ?    <p>Arten skal risikovurderes som dørstokkart.</p> 
                :    <p>Arten faller utenfor avgrensningen og skal ikke risikovurderes som dørstokkart.</p>}
            
        </div>
        );
    }
}

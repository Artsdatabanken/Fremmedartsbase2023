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
            <div style={{marginBottom: '20px'}}>
               <div className="filters">
                    <h3>Etableringspotensial</h3>
                    
                    <div className="scanning">
                        <p>Hvor mange 2 km x 2 km-ruter kan arten kolonisere i løpet av en 10 års-periode basert på én introduksjon til norsk natur? 
                            (Anta at selve introduksjonen skjer i perioden f.o.m. i dag og inntil 40 år fram i tid).</p>

                            <Xcomp.StringEnum observableValue={[assessment, "horizonEstablismentPotential"]} mode="radio" codes={codes.HorizonEstablismentPotential}/>

                            {/* <Xcomp.Radio
                            // TO DO: change the code and observable value
                                kode={"Etableringspotensial"}
                                label={"0 (dvs. arten er utgått fra introduksjonsstedet)"}
                                observableValue={[assessment, "etableringspotensial"]}/> 
                                <Xcomp.Radio
                            // TO DO: change the code and observable value
                                kode={"Etableringspotensial"}
                                label={"1 (dvs. arten er verken utdødd eller har ekspandert)"}
                                observableValue={[assessment, "etableringspotensial"]}/> 
                                <Xcomp.Radio
                            // TO DO: change the code and observable value
                                kode={"Etableringspotensial"}
                                label={"2 eller flere (arten har ekspandert)"}
                                observableValue={[assessment, "etableringspotensial"]}/>  */}
                        </div>
                        <Xcomp.HtmlString observableValue={[assessment, 'horizonEstablismentPotentialDescription']} placeholder="Utfyllende informasjon" /> 
               </div>
               <div  className="filters">
                    <h3>Økologisk effekt</h3>
                    <div className="scanning">
                        <p>Er det noen kjente (fra utlandet) eller antatte (i Norge) negative økologiske effekter knyttet til arten?</p>

                        <Xcomp.StringEnum observableValue={[assessment, "horizonEcologicalEffect"]} mode="radio" codes={codes.HorizonEcologicalEffect}/>

                        {/* <Xcomp.Radio
                            // TO DO: change the code and observable value
                                kode={"Oekologiskeffekt"}
                                label={"Ja, men bare så lenge arten er til stede "}
                                observableValue={[assessment, "oekologiskeffekt"]}/> 
                                <Xcomp.Radio
                            // TO DO: change the code and observable value
                                kode={"Oekologiskeffekt"}
                                label={"Ja, og effekten vedvarer også etter at arten er borte"}
                                observableValue={[assessment, "oekologiskeffekt"]}/> 
                                <Xcomp.Radio
                            // TO DO: change the code and observable value
                                kode={"Oekologiskeffekt"}
                                label={"Nei"}
                                observableValue={[assessment, "oekologiskeffekt"]}/>  */}
                    </div>
                    <Xcomp.HtmlString observableValue={[assessment, 'horizonEcologicalEffectDescription']} placeholder="Utfyllende informasjon" />
               </div>
               
            </div>

            { assessment.horizonEstablismentPotential == null || assessment.horizonEcologicalEffect == null ? 
                <b>Husk å svare på spørsmålene om artens etableringspotensial og økologiske effekt før du går videre.</b> : 
                (assessment.horizonEstablismentPotential == "2" || (assessment.horizonEstablismentPotential == "1" && assessment.horizonEcologicalEffect != "no") || (assessment.horizonEstablismentPotential == "0" && assessment.horizonEcologicalEffect == "yesAfterGone")) ? 
                <p>Arten skal risikovurderes som dørstokkart. Gå videre til Artens status.</p> :
                <p>Arten faller utenfor avgrensningen og skal ikke risikovurderes.</p> }
            {/*  (assessment.horizonEstablismentPotential == "2" || (assessment.horizonEstablismentPotential == "1" && assessment.horizonEcologicalEffect != "no") || (assessment.horizonEstablismentPotential == "0" && assessment.horizonEcologicalEffect == "yesAfterGone")) ? 
                    <p>Arten skal risikovurderes som dørstokkart. Gå videre til Artens status.</p> :
            <p>Arten faller utenfor avgrensningen og skal ikke risikovurderes som dørstokkart.</p>*/}
            
        </div>
        );
    }
}

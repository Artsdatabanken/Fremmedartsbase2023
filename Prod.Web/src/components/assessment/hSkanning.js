import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {autorun, extendObservable, observable} from 'mobx';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'
import NaturtypeTable from './40Naturtyper/naturtypeTable';
import NewNaturetype from './40Naturtyper/newNaturetype';
// import NaturtypeSelector from './naturtypeSelector';
import RedlistedNaturetypeTable from './40Naturtyper/redlistedNaturetypeTable';
import NewRedlistedNaturetype from './40Naturtyper/newRedlistedNaturetype';
// import BsModal from './bootstrapModal' import RedlistedNaturtypeSelector from
// './40Naturtyper/redlistedNaturetypeSelector';

@inject("appState")
@observer
export default class Vurdering40Naturtyper extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment}, appState} = this.props;

        // extendObservable(this, { })
        this.addNaturtype = (nyNt) => {
            assessment
                .impactedNatureTypes
                .push(nyNt)
        }
        this.addRedlistedNaturetype = (nyNt) => {
            assessment
                .redlistedNatureTypes
                .push(nyNt)

            // alert("add new redlisted nature type: " + nyNt.RedlistedNatureTypeName + " -
            // " + nyNt.Category)
        }
    }

    render() {
        const {appState:{assessment}, appState} = this.props;
        const riskAssessment = assessment.riskAssessment // fabModel.activeRegionalRiskAssessment
        // const labels = config.labels.NatureType
        
        
        const labels = appState.codeLabels
        const koder = appState.koder.Children

        
        // const labels = appState.kodeLabels
        const ntLabels = labels.NatureTypes


        // console.log("keys: " + JSON.stringify(Object.keys(assessment)))




        const critC = getCriterion(riskAssessment, 0, "C")
        const critF = getCriterion(riskAssessment, 1, "F")
        const critG = getCriterion(riskAssessment, 1, "G")
        const nts = appState.naturtyper
        const doms = appState.dominansSkog
        const canRenderTable = !!appState.naturtypeLabels && (!!appState.dominansSkog || appState.language === "SV")
        return (
            <div style={{display: 'flex', marginBottom: '20px', height: '100%'}}>
               <div className="filters" style={{float: 'left', width: '50%'}}>
                    <h3>Etableringspotensial</h3>
                    
                    <div className="scanning">
                        <p>Hvor mange 2 km x 2 km-ruter kan arten kolonisere i løpet av en 10 års-periode basert på én introduksjon til norsk natur? 
                            (Anta at selve introduksjonen skjer i perioden f.o.m. i dag og inntil 40 år fram i tid).</p>

                            <Xcomp.Radio
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
                                observableValue={[assessment, "etableringspotensial"]}/> 
                        </div>
                        <Xcomp.HtmlString observableValue={[assessment, 'etableringspotensial']} /> {/* earlier named: 'NaturalOrigin' */}
               </div>
               <div  className="filters" style={{float: 'right', width: '50%'}}>
                    <h3>Økologisk effekt</h3>
                    <div className="scanning">
                        <p>Er det noen kjente (fra utlandet) eller antatte (i Norge) negative økologiske effekter knyttet til arten?</p>

                        <Xcomp.Radio
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
                                observableValue={[assessment, "oekologiskeffekt"]}/> 
                    </div>
                    <Xcomp.HtmlString observableValue={[assessment, 'oekologiskeffekt']} /> {/* earlier named: 'NaturalOrigin' */}
               </div>
            </div>
        );
    }
}

// Vurdering40Naturtyper.propTypes = {
//     // fabModel: PropTypes.object.isRequired,
//     appState: PropTypes.object.isRequired,
//     assessment: PropTypes.object.isRequired
// }

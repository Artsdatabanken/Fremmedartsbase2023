import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import auth from '../authService'
import * as Xcomp from './observableComponents'
//import config from '../../config';
import { action } from 'mobx';

class Assessment90Summary extends Component {
    setAssessmentComplete(appState) {
        // sjekker før ferdigstilling        
        if (appState.assessment.kategoriFraForrigeListe !== null && 
            appState.assessment.kategoriFraForrigeListe.length > 1 && 
            appState.assessment.kategoriFraForrigeListe !== appState.assessment.kategori && 
            (appState.assessment.årsakTilEndringAvKategori == "" || appState.assessment.årsakTilEndringAvKategori == null)) {
            alert("Kategori endret fra 2015 - oppgi årsak til endring av kategori!")
        } else {
            const r = confirm("Er du sikker på at du vil ferdigstille vurderingen?")
            if (r) {
                appState.setAssessmentComplete("finish")
            }
        }
    }
    resetAssessmentComplete(appState) {
        const r = confirm("Er du sikker på at du vil åpne for videre vurdering?")
        if (r) {
                appState.setAssessmentComplete("unfinish")
        }
    }
    copyThisAssessmentToTestarter(appState) {
        const r = confirm("Er du sikker på at du vil kopiere vurderingen til testarter?")
        if (r) {
            appState.copyThisAssessmentToTestarter()
        }
    }
    deleteStyling(text) {
        var stylingRegex = /style/ig;    
        if(text) {
            let s = text.match(stylingRegex);
          if (s) {
            for (let i = 0; i < s.length; i++) {
                text = text.replace(s[i], " ");
              }
          }
        }
        return text;  
    }
    render() {
        if (window.appInsights) {
            window.appInsights.trackPageView({name: 'AssessmentOverview'});
        }
        const {appState, appState:{assessment, koder}} = this.props
        const kodeTekst = (kodegruppe, id) => {
            const gr = koder[kodegruppe]
            if (!gr) return "no code group: " + kodegruppe
            const match = gr.find(kode => kode.value = id)
            return match && match.text ? match.text : id
        }
        action(() => (assessment.kriteriedokumentasjon = this.deleteStyling(assessment.kriteriedokumentasjon)))();
        return (
            <div className="page_container">
                <div className="page_wrapper">
                    <h2>Oppsummering og kriterier Fremmedartslista 2023</h2>
                    <div className="upper_description">
                        <h3>Kriterieoppsummering</h3>   
                        <br/>
                            {/* 
                            Her er et kriteriesett som skal injiseres 
                            @Html.Partial("kriterieOppsummering", new { katkrit = "oppsummeringTotal" })

                            <AssessmentCriteria criteria={assessment.oppsummeringTotal} />
                            */} 
                        
                    </div>
                    <div className="form_category">
                        <div className="form_item">
                            <h3>Datamangel</h3>
                            <p>
                                Skal arten settes til kategori LC, NA eller NE? Oppgi dette på artsinformasjonsfanen.
                            </p>
                        </div>                        
                    </div>
                    <div className="form_category">
                        <div className="form_item">     
                            <h3>Trolig utdødd</h3>
                            <Xcomp.Bool disabled={assessment.kategori != 'CR'}  label="Arten er trolig utdødd fra Norge, men det er en liten mulighet for den er tilstede (CR – trolig utdødd)" observableValue={[assessment, 'troligUtdodd']} />
                        </div>
                    </div>                   
                    <div className="form_category">
                        <h3>Oppsummering av vurderingen</h3>
                        <Xcomp.HtmlString observableValue={[assessment, 'kriteriedokumentasjon']} />
                    </div>
                    <div className="form_category">
                        <h2>Rødlistevurdering, fase 2, nedgradering av kategori</h2>
                        <div className="form_item">                            
                            <p>Er utdøing sterkt påvirket av populasjoner i naboland?</p>  
                            <Xcomp.StringEnum observableValue={[assessment, 'utdøingSterktPåvirket']} codes={[{"text": "Nei","value": "Nei" },{"text": "Ja","value": "Ja"}]} mode="radio"/>
                            {assessment.utdøingSterktPåvirket === 'Ja'
                            ? <table className="table table-striped">
                                <thead>                                
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Kategori endret til</td>
                                        <td><Xcomp.StringEnum 
                                                observableValue={[assessment, 'kategoriEndretTil']} 
                                                codes={koder.kategoriEndretTilKode} /></td>
                                    </tr>
                                </tbody>
                                </table>
                            : null}                          
                        </div>                       
                    </div>
                    {assessment.utdøingSterktPåvirket  === 'Ja'
                    ? <div className="form_category">
                        <h3>Årsak til nedgradering av kategori</h3>                        
                        <Xcomp.HtmlString
                            observableValue={[assessment, 'årsakTilNedgraderingAvKategori']}/>
                    </div>
                    : null}
                    <div className="form_category">   
                        <h3>Endelig rødlistevurdering</h3> 
                        <div className="form_item">
                            <p>Kategori Rødlista 2021: {assessment.kategori}  </p>
                            {(assessment.vurderingsår === 2015 || assessment.vurderingsår === 2010) 
                            ? <p>Kategori Rødlista {assessment.vurderingsår}: {assessment.kategoriFraForrigeListe} </p>  
                            : null}
                        </div>  
                        {(assessment.vurderingsår === 2015 || assessment.vurderingsår === 2010) && assessment.kategori != assessment.kategoriFraForrigeListe 
                        ? <div className="container_description">   
                            <div className="criteria_list">                        
                                <table className="choice">
                                <thead>                                
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Endring fra {assessment.vurderingsår}-listen er en følge av</td>
                                            <td><Xcomp.StringEnum 
                                                    observableValue={[assessment, 'årsakTilEndringAvKategori']} 
                                                    codes={koder.endringFra2015ID} /></td>
                                        </tr>
                                    </tbody>
                                </table> 
                            </div>                                                
                        </div>
                        : null} 
                        <div className="form_item">
                            <div className="" style={{marginLeft: 0}}>
                                {appState.isDirty && assessment.evaluationStatus !== 'finished' 
                                ? <div>
                                    Vurderingen er ikke lagret
                                    <p style={{marginTop: '10px'}}>
                                        <Xcomp.Button 
                                            alwaysEnabled={false} 
                                            disabled={true} >
                                            {assessment.evaluationStatus === 'finished' 
                                            ? "Fortsett vurdering" 
                                            : "Ferdigstill"}
                                        </Xcomp.Button>
                                    </p>
                                </div>
                                : assessment.evaluationStatus !== 'finished' && appState.expertgroup !== null && appState.roleincurrentgroup 
                                ? <div>
                                    Vurderingen er under arbeid
                                    <p style={{marginTop: '10px'}}>
                                        <Xcomp.Button 
                                            alwaysEnabled={appState.roleincurrentgroup.admin} 
                                            onClick={() => this.setAssessmentComplete(appState)}>
                                            Ferdigstill
                                        </Xcomp.Button>
                                    </p>
                                </div>
                                : assessment.evaluationStatus === 'finished' && appState.expertgroup !== null && appState.roleincurrentgroup 
                                ? <div>
                                    Vurderingen er ferdigstilt
                                    <p style={{marginTop: '10px'}}>
                                        <Xcomp.Button 
                                            alwaysEnabled={appState.roleincurrentgroup.admin} 
                                            onClick={() => this.resetAssessmentComplete(appState)}>
                                            Fortsett vurdering
                                        </Xcomp.Button></p></div>
                                : null}
                                {/* {auth.isAdmin ? */}
                                <div style={{float: "right", backgroundColor: "#eee", width: 10, height: 10}} onClick={() => this.copyThisAssessmentToTestarter(appState)} />
                                {/* : null} */}
                                {auth.isAdmin 
                                ? <div className="form_item"><Xcomp.Button href={appState.AssessmentReportLink} alwaysEnabled>Artsrapport</Xcomp.Button></div>
                                : null
                                }
                            </div>
                        </div>
                    </div>
                    <div className="form_category">
                        <h3>Kommentarer til intern bruk</h3>
                        <Xcomp.HtmlString observableValue={[assessment, 'kommentarer']} />
                    </div>
                    {<div className="form_category">
                        <h4>Filvedlegg til vurderingen</h4>
                    </div>}
                </div>
            </div>
        )}}

export default inject('appState')(observer(Assessment90Summary));
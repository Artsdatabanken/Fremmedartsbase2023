import React from 'react'
import config from '../../config';
import {observer, inject} from 'mobx-react'
import * as Xcomp from './observableComponents'
import Tabs from '../tabs'
import Assessment51Naturtyper from './assessment51Naturtyper'
@inject('appState')
@observer
export default class Assessment52Utbredelse extends React.Component {
    render() {
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props
        // const {appState:{assessment}, vurdering, fabModel} = this.props
        //const labels = fabModel.kodeLabels.DistributionHistory
        
        // const labels = fabModel.codeLabels.DistributionHistory
        const labels = appState.codeLabels.DistributionHistory
        return (
            <div>
                <div>
                    {assessment.alienSpeciesCategory == "DoorKnocker" ? 
                    <fieldset className="well">
                        <h2>Utbredelse i Norge</h2>
                        <h3>Forekomstareal</h3>
                        <div>
                            <p>Hvor mange 2 km x 2 km-ruter kan arten kolonisere i løpet av en 10 års-periode basert på én introduksjon til norsk natur? (Innenfor vurderingsperioden på 50 år)?</p>
                            <p>Hvor mange slike introduksjoner til norsk natur antas arten å få i løpet av samme 10-års periode?</p>
                            <p>Totalt forekomstareal <b> 10 år etter første introduksjon </b> (km<sup>2</sup>)</p>
                            <p>Andel av antatt forekomstareal i sterkt endra natur (%)</p>
                        </div>
                        </fieldset> :
                        <fieldset className="well">
                        <h2>Utbredelse i Norge</h2>
                        <h3>Forekomstareal</h3>
                        <div style={{marginBottom: '20px'}}>
                            <span>{labels.goTo}</span> <Xcomp.Button primary >{labels.speciesMap}</Xcomp.Button>
                        </div>
                       {/* <div style={{marginBottom: '20px'}}>
                            <span>{labels.goTo}</span> <Xcomp.Button primary >{labels.distributionHistory}</Xcomp.Button>
                         </div> */}
                        
                        <div>
                            <p>Forekomstareal i dag (km<sup>2</sup>):</p>
                            <p>Forekomstareal <b>om 50 år </b> (km<sup>2</sup>)</p>
                            <p>Andel av kjent forekomstareal i sterkt endra natur (%)</p>
                        </div>
    
                        <div>
                            <p>Med utgangspunkt <b>én introduksjon</b>, antas arten å være… </p>                        
                            <Xcomp.Radio kode={"BB–E"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og produsere levedyktig avkom i minst 10 forekomster i norsk natur [BB E]"} />
                            <Xcomp.Radio kode={"BB-D2"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og produsere levedyktig avkom i 1 til 9 forekomster i norsk natur [BB D2]"} />
                            <Xcomp.Radio kode={"BB-D1"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og i tillegg ha levedyktige individer i minst én forekomst i norsk natur [BB D1]"} />
                        </div>
                    </fieldset>}
                <fieldset className="well">
                    <h2>Fylkesvis utbredelse</h2>
                    <p>Beskriv grunnlaget for anslagene (gjelder både forekomstareal og fylkesvis utbredelse)</p>
                    <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'backgroundRegional']}/>
                    {assessment.alienSpeciesCategory == "DoorKnocker" ?
                        <p>Beskriv antatt utbredelse <i>(overføres til oppsummeringen)</i></p> :

                        <p>Beskriv utbredelseshistorikk og dagens utbredelse i Norge <i>(overføres til oppsummeringen)</i></p>
                    }
                    
                    <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'historyAndAreaInNorway']}/>
                    <h3>Annen informasjon</h3>
                    <div className="statusField">
                        <p>Kjent utbredelsesområde (km<sup>2</sup>)</p>
                        <Xcomp.Number                            
                                    observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoors"]}
                                    integer
                                />    
                        </div>
                        <div className="statusField">
                        <p>Bestandsstørrelse</p>
                        <Xcomp.Number                            
                                    observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoors"]}
                                    integer
                                />
                    </div>
                </fieldset>
                <fieldset className="well" id="spreadHistoryDomestic">
                    <h2>Utbredelseshistorikk 2018</h2>
                    {/* <h4>{labels.distributionHistory} {fabModel.evaluationContext.nameWithPreposition}</h4>
                   {vurdering.SpreadHistoryDomesticDocumentation
                    ? <div>
                        <h4>{labels.previousInfo}. <b>{labels.mustTransfer}</b></h4>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: vurdering.SpreadHistoryDomesticDocumentation
                            }} />
                        <Xcomp.Button onClick={() => {
                            const existing = vurdering.RiskAssessment.CriteriaDocumentationDomesticSpread
                            const newstring = !existing
                                ? vurdering.SpreadHistoryDomesticDocumentation
                                : existing + vurdering.SpreadHistoryDomesticDocumentation
                            vurdering.RiskAssessment.CriteriaDocumentationDomesticSpread = newstring
                            vurdering.SpreadHistoryDomesticDocumentation = null
                        }}>{labels.transfer}</Xcomp.Button>
                        <hr />
                      </div>
                    : null } 
                    <Xcomp.HtmlString
                        observableValue={[vurdering.RiskAssessment, 'CriteriaDocumentationDomesticSpread']}/>*/}
                        
                </fieldset>
            
                    
                    {config.showPageHeaders
                        ? <h3>{fabModel.kodeLabels.DistributionHistory.heading}</h3>
                        : <br/>}
                    {/*<UtbredelseshistorikkInnenlands vurdering={vurdering} fabModel={fabModel}/>
                    <UtbredelseIDag vurdering={vurdering} fabModel={fabModel}/>
                    <Utbredelseshistorikk vurdering={vurdering} fabModel={fabModel}/>*/}
            </div>
                
                {/* <fieldset className="well" id="spreadHistoryForeign">
                    <h4>{labels.distributionHistoryAbroad}</h4>
                   <Xcomp.HtmlString
                        observableValue={[vurdering, 'SpreadHistoryForeignDocumentation']}/> 
                </fieldset>*/}
            </div>
        )
    }
}
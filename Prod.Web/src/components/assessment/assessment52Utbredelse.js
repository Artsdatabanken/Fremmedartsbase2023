import React from 'react'
import config from '../../config';
import {observer, inject} from 'mobx-react'
import * as Xcomp from './observableComponents'
import Tabs from '../tabs'
import Assessment51Naturtyper from './assessment51Naturtyper'
import DistributionTable from './distributionTable'
import UtbredelseshistorikkInnenlands from './35Utbredelseshistorikk/UtbredelseshistorikkInnenlands'
import UtbredelseIDag from './35Utbredelseshistorikk/UtbredelseIDag'
import Utbredelseshistorikk from './35Utbredelseshistorikk/Utbredelseshistorikk'
@inject('appState')
@observer
export default class Assessment52Utbredelse extends React.Component {
    render() {
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props
        // const {appState:{assessment}, vurdering, fabModel} = this.props
        //const labels = fabModel.kodeLabels.DistributionHistory
        
        // const labels = fabModel.codeLabels.DistributionHistory
        const koder = appState.koder
        const labels = appState.codeLabels.DistributionHistory
        return (
            <div>
                <div>
                <fieldset className="well">
                        <h2>Utbredelse i Norge</h2>
                        <h3>Forekomstareal</h3>
                    {assessment.alienSpeciesCategory == "DoorKnocker" ? 
                        <div>
                        <div className="statusField">
                            <div className="labels distribution">
                                <p>Hvor mange 2 km x 2 km-ruter kan arten kolonisere i løpet av en 10 års-periode basert på én introduksjon til norsk natur? (Innenfor vurderingsperioden på 50 år)?</p>
                                <p>Hvor mange slike introduksjoner til norsk natur antas arten å få i løpet av samme 10-års periode?</p>
                                <p>Totalt forekomstareal <b> 10 år etter første introduksjon </b> (km<sup>2</sup>)</p>
                                
                            </div>
                            <div className="distribution">
                                <DistributionTable/>
                            </div>
                        </div>
                        <div className="changedNature">
                            <p>Andel av antatt forekomstareal i sterkt endra natur (%)</p>
                             <Xcomp.StringEnum observableValue={[assessment.riskAssessment, "speciesDistribution"]} codes={koder.KnownDistributionInNature}/> 
                        </div>
                        </div>
                         :
                        <div>
                            <span>{labels.goTo}</span> <Xcomp.Button primary >{labels.speciesMap}</Xcomp.Button>
                            <p>Basert på periode:</p>
                            <div style={{display: 'flex'}}>
                                        <div style={{marginRight: '30px'}}>
                                        <p> f.o.m. år (t0)</p>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "startYear"]}
                                            yearRange={true}/> 
                                        </div>
                                        <div>
                                        <p>t.o.m. år (t2)</p>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "endYear"]}
                                            yearRange={true}/> 
                                        </div> 
                                    </div>
                            <div className="statusField">
                                <div className="labels distribution">
                                    
                                
                                    <div style={{display: 'flex', marginTop: '40px', marginBottom: '150px'}}>
                                    <p>Forekomstareal <b>i dag</b> (km<sup>2</sup>):</p>
                                    {assessment.alienSpeciesCategory != "DoorKnocker" && 
                                    <div style={{width: '100px', marginTop: '50px'}}>
                                        <b>Kjent</b>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "knownDistribution"]}
                                             /> 
                                    </div>
                                    }
                                    </div>
                                    <p>Forekomstareal <b>om 50 år </b> (km<sup>2</sup>)</p>
                                    
                                </div>
                                <div className="distribution">
                                <DistributionTable/>
                            </div>
                        </div>
                        <div className="changedNature">
                            <p>Andel av kjent forekomstareal i sterkt endra natur (%) </p>
                            <Xcomp.StringEnum observableValue={[assessment.riskAssessment, "speciesDistribution"]} codes={koder.KnownDistributionInNature}/>
                         </div>
                         <div style={{marginTop: '50px'}}>
                            <p>Med utgangspunkt <b>én introduksjon</b>, antas arten å være… </p>   
                            <Xcomp.StringEnum observableValue={[assessment.riskAssessment, "speciesDistribution"]} mode="radio" codes={koder.DistributionOptions}/>  
                        </div>             
                         {/* <div style={{marginBottom: '20px'}}>
                            <span>{labels.goTo}</span> <Xcomp.Button primary >{labels.distributionHistory}</Xcomp.Button>
                         </div> */}
                        </div>
                   }
                    <div>
                            
                           {/* <Xcomp.Radio kode={"BB–E"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og produsere levedyktig avkom i minst 10 forekomster i norsk natur [BB E]"} />
                            <Xcomp.Radio kode={"BB-D2"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og produsere levedyktig avkom i 1 til 9 forekomster i norsk natur [BB D2]"} />
                        <Xcomp.Radio kode={"BB-D1"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og i tillegg ha levedyktige individer i minst én forekomst i norsk natur [BB D1]"} />*/}
                        </div>
                        </fieldset>
                <fieldset className="well">
                    <h2>Fylkesvis utbredelse</h2>
                    <b>[Her kommer det et kart]</b>
                    <p>Beskriv grunnlaget for anslagene (gjelder både forekomstareal og fylkesvis utbredelse)</p>
                    <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'backgroundRegional']}/>
                    {assessment.alienSpeciesCategory == "DoorKnocker" ?
                        <p>Beskriv antatt utbredelse <i>(overføres til oppsummeringen)</i></p> :

                        <p>Beskriv utbredelseshistorikk og dagens utbredelse i Norge <i>(overføres til oppsummeringen)</i></p>
                    }
                    <Xcomp.HtmlString
                        observableValue={[assessment.riskAssessment, 'criteriaDocumentationDomesticSpread']}/>
                    {/*<Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'historyAndAreaInNorway']}/>*/}
                </fieldset>
                <fieldset className="well">
                    <h3>Annen informasjon</h3>
                    <div className="statusField">
                        <div className="labels">
                            <p>Kjent utbredelsesområde (km<sup>2</sup>)</p>
                            <p>Bestandsstørrelse</p>
                        </div>
                        <div className="numbers otherInfo">
                            <Xcomp.Number                            
                                        observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoors"]}
                                        integer
                                    />    
                             <Xcomp.Number                            
                                    observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoors"]}
                                    integer
                                />
                        </div>
                    </div>
                        
                </fieldset>
                <fieldset className="well" id="spreadHistoryDomestic">
                    <h2>Utbredelseshistorikk 2018</h2>
                  {/* <h4>{labels.distributionHistory} {appState.evaluationContext.nameWithPreposition}</h4>*/}
                   <UtbredelseshistorikkInnenlands vurdering={assessment} fabModel={appState}/>
                   {assessment.spreadHistoryDomesticDocumentation
                    ? <div>
                        <h4>{labels.previousInfo}. <b>{labels.mustTransfer}</b></h4>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: assessment.spreadHistoryDomesticDocumentation
                            }} />
                        <Xcomp.Button onClick={() => {
                            const existing = assessment.riskAssessment.criteriaDocumentationDomesticSpread
                            const newstring = !existing
                                ? assessment.spreadHistoryDomesticDocumentation
                                : existing + assessment.spreadHistoryDomesticDocumentation
                                assessment.riskAssessment.criteriaDocumentationDomesticSpread = newstring
                            assessment.spreadHistoryDomesticDocumentation = null
                        }}>{labels.transfer}</Xcomp.Button>
                        <hr />
                      </div>
                    : null } 
                    
                        
                </fieldset>
            
                    
                    {config.showPageHeaders
                        ? <h3>{fabModel.kodeLabels.DistributionHistory.heading}</h3>
                        : <br/>}
                    
                   {/* <UtbredelseIDag vurdering={assessment} fabModel={appState}/>
                    <Utbredelseshistorikk vurdering={assessment} fabModel={appState}/>*/}
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
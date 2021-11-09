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
import ModalArtskart from '../artskart/ModalArtskart';
import Fylkesforekomst from '../fylkesforekomst/Fylkesforekomst';
import FileUpload from '../FileUpload'
import fylker from "../fylkesforekomst/fylker";
import { ContactsOutlined } from '@material-ui/icons';
import { action, computed } from 'mobx';

@inject('appState')
@observer
export default class Assessment52Utbredelse extends React.Component {
    // @computed get isDirty() {
    //     if (!this.props.appState.assessmentId) return false
    //     const a = JSON.stringify(this.props.appState.assessment)
    //     const b = this.props.appState.assessmentSavedVersionString
    //     return a != b
    // }

    // a method to check if a given property is smaller than a given value
    checkArea = (property, value) => {
               return property < value;
    }

    handleOverførFraArtskart = ({ selectionGeometry, countylist, areadata, observations, editStats }) => {
        // console.log('handleOverførFraArtskart', selectionGeometry, countylist, areadata, observations, editStats);
        const aps = this.props.appState;
        const ass = aps.assessment;
        
        ass.b1UtbredelsesområdeKjentAndel = areadata.AreaExtentOfOccurrence;
        ass.artskartManuellAdd = editStats.add;
        ass.artskartManuellRemove = editStats.remove;
        ass.artskartSistOverført = new Date();
        ass.artskartSelectionGeometry = selectionGeometry;
        if (ass.artskartSelectionGeometry != undefined) {
            ass.riskAssessment.AOO2 = areadata.ExcludedLocalities*4;
        } else {
            ass.riskAssessment.AOO2 = areadata.AreaOfOccupancy;
        }
        // TODO: Fylkesoversikt - avventer data fra API
        if (countylist) {
            // ass.fylkesforekomster = countylist;
            let fo = countylist.reduce((acc, e) => {
                acc[e.NAVN] = e.Status;
                return acc;
            }, {});
            ass.fylkesforekomster.forEach(f => f.state = fo[fylker[f.fylke]] > 0 ? 0 : 2);
            // console.log('ass.fylkesforekomster', ass.fylkesforekomster);
        }

        // Vi ønsker bare lagre redigeringer
        const points2String = source =>
            observations.features
                .filter(p => p.source === source)
                .map(p => p.geometry.coordinates)
                .map(p => p[0] + "," + p[1])
                .join(",");
        ass.artskartAdded = points2String("add");
        ass.artskartRemoved = points2String("remove");
    }

    render() {
        // console.log('Assessment52Utbredelse');
        const renderAgain = this.isDirty;
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props;
        // const {appState:{assessment}, vurdering, fabModel} = this.props
        // const labels = fabModel.kodeLabels.DistributionHistory
        
        // const labels = fabModel.codeLabels.DistributionHistory
        const koder = appState.koder
        const labels = appState.codeLabels.DistributionHistory
        return (
            <div>
                <div>
                    <fieldset className="well">
                        <h2>Utbredelse i Norge</h2>
                        <h4>Forekomstareal</h4>
                        {assessment.alienSpeciesCategory == "DoorKnocker" ? 
                        <div>
                            <div className="statusField">
                                <div className="labels distribution">
                                    <p>Hvor mange 2 x 2 km-ruter kan arten kolonisere i løpet av en 10 års-periode basert på én introduksjon til norsk natur? (Innenfor vurderingsperioden på 50 år)?</p>
                                    <p>Hvor mange slike introduksjoner til norsk natur antas arten å få i løpet av samme 10-års periode?</p>
                                    <p>Totalt forekomstareal <b> 10 år etter første introduksjon </b> (km<sup>2</sup>)</p>
                                    
                                </div>
                                <div className="distribution">
                                    <DistributionTable/>
                                </div>
                            </div>
                            <div className="changedNature">
                                <p>Andel av antatt forekomstareal i sterkt endra natur (%)</p>
                                
                             <Xcomp.StringEnum observableValue={[assessment, "spreadAreaInChangedNature"]} codes={koder.KnownDistributionInNature}/> 
                            </div>
                            </div>
                            :
                            <div>
                                {/* <span>{labels.goTo}</span> <Xcomp.Button primary>{labels.speciesMap}</Xcomp.Button> */}
                                <div style={{marginLeft: 20, marginBottom: 30}}>
                                    <ModalArtskart
                                        taxonId={assessment.taxonId}
                                        scientificNameId={assessment.evaluatedScientificNameId}
                                        evaluationContext={assessment.evaluationContext}
                                        labels={labels}
                                        utvalg={assessment.riskAssessment}
                                        onOverførFraArtskart={action(this.handleOverførFraArtskart)}
                                        />
                                </div>
                                <p style={{marginBottom: '0'}}>Basert på periode:</p>
                                <div className="distributionYears">
                                    <p style={{marginRight: '30px'}}>
                                        <p> f.o.m. år (t<sub>0</sub>)</p>
                                        <Xcomp.Number
                                            style={{marginLeft: 20}}
                                            observableValue={[assessment.riskAssessment, "AOOyear1"]}
                                            yearRange={true}/> 
                                    </p>
                                    <p>
                                        <p>t.o.m. år</p>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "AOOyear2"]}
                                            yearRange={true}/> 
                                    </p> 
                                </div>
                                <div className="statusField">
                                    <div className="labels distribution">
                                        <div style={{display: 'flex', marginTop: '40px', marginBottom: '150px'}}>
                                            <p>Forekomstareal <b>i dag</b> (km<sup>2</sup>):</p>
                                            {assessment.alienSpeciesCategory != "DoorKnocker" && 
                                            <div style={{width: '100px', marginTop: '44px'}}>
                                                <b>Kjent</b>
                                                <Xcomp.Number      
                                                    className={"knownDistribution"} 
                                                    //observableValue={[assessment.riskAssessment, "knownDistribution"]}                     
                                                    observableValue={[assessment.riskAssessment, "AOO2"]}
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
                                    {/* ToDo: Bug - speciesDistribution not found */}
                                    <Xcomp.StringEnum observableValue={[assessment, "spreadAreaInChangedNature"]} codes={koder.KnownDistributionInNature}/>
                                </div>
                                {assessment.speciesStatus == "C3" && 
                                <div style={{marginTop: '50px'}}>
                                    <p>Hvilken etableringskategori har arten i Norge? Merk av den høyeste (øverste) kategorien som oppfylles av arten i Norge i dag.</p>   
                                    {/* ToDo: Bug - speciesDistribution not found */}
                                    <Xcomp.StringEnum observableValue={[assessment, "speciesEstablishmentCategory"]} mode="radio" option="E" optionHidden={this.checkArea(assessment.riskAssessment.AOOtotalBest, "40")} codes={koder.DistributionOptions}/>
                                </div>    
                                }         
                                {/* <div style={{marginBottom: '20px'}}>
                                    <span>{labels.goTo}</span> <Xcomp.Button primary >{labels.distributionHistory}</Xcomp.Button>
                                </div> */}
                            </div>
                        }
                        <p>Velg datafil du ønsker å laste opp</p>
                         <FileUpload
                                onUploadComplete={this.getAttachments}
                                showButtonOnly={true} /> 
                        <div>
                                
                            {/* <Xcomp.Radio kode={"BB–E"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og produsere levedyktig avkom i minst 10 forekomster i norsk natur [BB E]"} />
                                <Xcomp.Radio kode={"BB-D2"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og produsere levedyktig avkom i 1 til 9 forekomster i norsk natur [BB D2]"} />
                            <Xcomp.Radio kode={"BB-D1"} observableValue={[assessment.riskAssessment, "speciesDistribution"]} label={"etablert og i tillegg ha levedyktige individer i minst én forekomst i norsk natur [BB D1]"} />*/}
                        </div>
                    </fieldset>
                <fieldset className="well">
                    <h4>Regionvis utbredelse</h4>
                    {/* <b>[Her kommer det et kart]</b> */}
                    {/* TODO: remove component refresh hack */ assessment.fylkesforekomster ? (assessment.fylkesforekomster.map(e => e.state ? '' : '')) : ''}
                    <Fylkesforekomst
                        evaluationContext={assessment.evaluationContext}
                        taxonId={assessment.TaxonId}
                        latinsknavnId={assessment.latinsknavnId}
                        utvalg={assessment.artskartModel}
                        {...assessment.artskartModel} // Rerender hack
                        artskartModel={assessment.artskartModel}  // could replace this one?
                        fylkesforekomster={assessment.fylkesforekomster}
                        assessment={assessment}
                        onOverførFraArtskart={action(this.handleOverførFraArtskart)} />
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
                    <h4>Annen informasjon</h4>
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
                                    //observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoors"]}
                                    observableValue={[assessment.riskAssessment, "populationSize"]}
                                    integer
                                />
                        </div>
                    </div>
                        
                </fieldset>
                <fieldset className="well" id="spreadHistoryDomestic">
                    <h4>Utbredelseshistorikk 2018</h4>
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
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
import fylker from "../fylkesforekomst/fylker_2017";
import Documents from '../documents'
import { ContactsOutlined } from '@material-ui/icons';
import { action, computed, observable } from 'mobx';

@inject('appState')
@observer
export default class Assessment52Utbredelse extends React.Component {
    // constructor(props) {
    //     super(props)
    //     const state = this.props.appState.assessment.fylkesforekomster.find(f => f.state0);
    //     if (state === undefined) {
    //         // 2 - ikke kjent
    //         // 3 - antatt om 50 år
    //         // 1 - antatt i dag
    //         // 0 - kjent
    //         this.props.appState.assessment.fylkesforekomster.forEach((f) => {
    //             if (f[`state${f.state}`] !== undefined) return;
    //             switch (f.state) {
    //                 case 0:
    //                     f[`state${f.state}`] = 1;
    //                     f['state1'] = 0;
    //                     f['state2'] = 0;
    //                     f['state3'] = 0;
    //                     break;
    //                 case 1:
    //                     f['state0'] = 0;
    //                     f[`state${f.state}`] = 1;
    //                     f['state2'] = 0;
    //                     f['state3'] = 0;
    //                     break;
    //                 case 2:
    //                     f['state0'] = 0;
    //                     f['state1'] = 0;
    //                     f[`state${f.state}`] = 1;
    //                     f['state3'] = 0;
    //                     break;
    //                 case 3:
    //                     f['state0'] = 0;
    //                     f['state1'] = 0;
    //                     f['state2'] = 0;
    //                     f[`state${f.state}`] = 1;
    //             }
    //             delete f.state;
    //             // console.log("Fylke", f.fylke, f.state, f.states);
    //         });
    //     }
    // }

    // code looks unused, but it makes the Artskart-module listen to changes
    @computed get isDirty() {
        if (!this.props.appState.assessmentId) return false
        const a = JSON.stringify(this.props.appState.assessment)
        const b = this.props.appState.assessmentSavedVersionString
        return a != b
    }

    // a method to check if a given property is smaller than a given value

       
    checkArea = (property) => {
       // finds all the objects with id's that should be hidden 
       if ( property < 8 ) {
           
           return "D1D2E"
           
       } else if (property < 40 ) {
           return "E"
       }
       else {
            return ""
       }
    }

    handleOverførFraArtskart = ({ selectionGeometry, countylist, areadata, observations, editStats }) => {
        // console.log('handleOverførFraArtskart', selectionGeometry, countylist, areadata, observations, editStats);
        const aps = this.props.appState;
        const ass = aps.assessment;

        if (ass.isAlienSpecies && ass.isRegionallyAlien) {
            console.log('working with vannområder...');
        }

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
        ass.riskAssessment.yearFirstProductionOutdoors = areadata.AreaExtentOfOccurrence;
        
        // TODO: Fylkesoversikt - avventer data fra API
        if (countylist) {
            // ass.fylkesforekomster = countylist;
            let fo = countylist.reduce((acc, e) => {
                acc[e.NAVN] = e.Status;
                return acc;
            }, {});
            // ass.fylkesforekomster.forEach(f => f.state = fo[fylker[f.fylke]] > 0 ? 0 : 2);
            ass.fylkesforekomster.forEach(f => {
                f.state0 = fo[fylker[f.fylke]] > 0 ? 1 : 0;
                if (f.state0 === 1) {
                    f.state2 = 0;
                } else if ((parseInt(f.state0) + parseInt(f.state1) + parseInt(f.state3)) === 0) {
                    f.state2 = 1;
                }
            });
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
        // console.log('assessment52...', ass.artskartAdded, ass.artskartRemoved);
    }

    render() {
        // console.log('Assessment52Utbredelse');
        const renderAgain = this.isDirty; // code looks unused, but it makes the Artskart-module listen to changes
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props;
        // const {appState:{assessment}, vurdering, fabModel} = this.props
        // const labels = fabModel.kodeLabels.DistributionHistory
        
        // const labels = fabModel.codeLabels.DistributionHistory
        const koder = appState.koder
        const generalLabels = appState.codeLabels 
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
                                        showWaterAreas={assessment.isAlienSpecies && assessment.isRegionallyAlien}
                                        labels={labels}
                                        utvalg={assessment.riskAssessment}
                                        onOverførFraArtskart={action(this.handleOverførFraArtskart)}
                                        artskartAdded={assessment.artskartAdded}
                                        artskartRemoved={assessment.artskartRemoved}
                                    />
                                </div>
                                <p style={{marginBottom: '0'}}>Basert på periode:</p>
                                <div className="distributionYears">
                                    <div style={{marginRight: '30px'}}>
                                        <p> f.o.m. år (t<sub>0</sub>)</p> 
                                        <Xcomp.Number
                                            style={{marginLeft: 20}}
                                            observableValue={[assessment.riskAssessment, "AOOyear1"]}
                                            yearRange={true}/> 
                                    </div>
                                    <div>
                                        <p>t.o.m. år</p>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "AOOyear2"]}
                                            yearRange={true}/> 
                                    </div> 
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
                                                    observableValue={[assessment.riskAssessment, "AOOknown"]}
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
                                    <p> {assessment.isRegionallyAlien ? generalLabels.SpeciesStatus.statusInNorwayRegionallyAlien : generalLabels.SpeciesStatus.statusInNorway } {generalLabels.SpeciesStatus.highestCategoryPerToday}</p>  
                                    <br/> 
                                    {/* ToDo: Bug - speciesDistribution not found */}
                                    <Xcomp.StringEnum observableValue={[assessment, "speciesEstablishmentCategory"]} mode="radio" options={this.checkArea(assessment.riskAssessment.AOOtotalBest)} codes={koder.DistributionOptions}/>
                                </div>    
                                }         
                                {/* <div style={{marginBottom: '20px'}}>
                                    <span>{labels.goTo}</span> <Xcomp.Button primary >{labels.distributionHistory}</Xcomp.Button>
                                </div> */}
                            </div>
                        }
                        <hr></hr>  
                            <div>
                                <Documents/>
                            </div>
                        

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
                        <label htmlFor="CurrentPresenceComment">{labels.describeAsumption}</label>
                        <Xcomp.HtmlString observableValue={[assessment, 'currentPresenceComment']}/>
                   {/* <p>Beskriv grunnlaget for anslagene (gjelder både forekomstareal og fylkesvis utbredelse)</p>
                    <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'backgroundRegional']}/>*/}
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
                                        observableValue={[assessment, "currentSpreadArea"]}
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
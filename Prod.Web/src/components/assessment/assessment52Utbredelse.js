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
import ModalSimpleMap from '../artskart/ModalSimpleMap';
import Fylkesforekomst from '../fylkesforekomst/Fylkesforekomst';
import FileUpload from '../FileUpload'
import fylker from "../fylkesforekomst/fylker_2017";
import Documents from '../documents'
import { ContactsOutlined } from '@material-ui/icons';
import { action, computed, observable, extendObservable } from 'mobx';
import SimpleMap from '../map/SimpleMap';
import WaterArea from '../water/WaterArea';
import { getWaterAreas } from '../water/apiWaterArea';
import mapOlFunc from '../map/MapOlFunctions';

@inject('appState')
@observer
export default class Assessment52Utbredelse extends React.Component {

    // code looks unused, but it makes the Artskart-module listen to changes
    @computed get isDirty() {
        if (!this.props.appState.assessmentId) return false
        const a = JSON.stringify(this.props.appState.assessment)
        const b = this.props.appState.assessmentSavedVersionString
        return a != b
    }

    // a method to check if a given property is smaller than a given value

    constructor(props) {
        super();
        extendObservable(this, {
            initialWaterAreas: null,
            selectedWaterArea: [],
            waterIsChanged: 0
        });
        if (props && props.appState && props.appState.assessment) {
            const assessment = props.appState.assessment;
            if (assessment.isAlienSpecies && assessment.isRegionallyAlien) {
                if (assessment.artskartWaterModel === null) assessment.artskartWaterModel = {};
                if (this.initialWaterAreas === null && assessment.isAlienSpecies && assessment.isRegionallyAlien) {
                    const self = this;
                    getWaterAreas().then((data) => {
                        action(() => {
                            self.initialWaterAreas = data;
                            const ass = assessment;
                            ass.artskartWaterModel.isWaterArea = ass.artskartWaterModel.isWaterArea ? ass.artskartWaterModel.isWaterArea : false;
                            self.reCreateartskartWaterModelArea({ ass, initialWaterAreas: self.initialWaterAreas });
                        })();
                    });
                }
                if (assessment.artskartWaterModel && assessment.artskartWaterModel.areas) {
                    this.selectedWaterArea = assessment.artskartWaterModel.areas
                    .filter(x => x.disabled === 0)
                    .map(x => x.globalId);
                }
            }
            if (assessment.artskartModel) {
                const getValue = (value) => {
                    return value !== undefined ? value : undefined;
                };
                assessment.observationFromYear = getValue(assessment.observationFromYear);
                assessment.observationToYear = getValue(assessment.observationToYear);
                assessment.includeObjects = getValue(assessment.includeObjects);
                assessment.includeNorge = getValue(assessment.includeNorge);
                assessment.includeSvalbard = getValue(assessment.includeSvalbard);
                assessment.excludeObjects = getValue(assessment.excludeObjects);
                assessment.excludeGbif = getValue(assessment.excludeGbif);
            } else {
                assessment.artskartModel = {};
            }
        }
    }

    reCreateartskartWaterModelArea = ({ ass, initialWaterAreas }) => {
        if (ass.artskartWaterModel.areas) return;
        const waterObject = ass.artskartWaterModel.isWaterArea ? initialWaterAreas.areaState : initialWaterAreas.regionState;
        ass.artskartWaterModel.areas = [];
        for (var key in waterObject) {
            // console.log('adding?', key);
            if (ass.artskartWaterModel.areas.find(x => x.globalId === key) === undefined) {
                // console.log('adding', key);
                ass.artskartWaterModel.areas.push(waterObject[key]);
            } else {
                console.log('not adding', key)
            }
        }
    }

    getWaterFeatures = (assessment) => {
        if (this.initialWaterAreas && assessment && assessment.artskartWaterModel) {
            return assessment.artskartWaterModel.isWaterArea ? this.initialWaterAreas.waterArea : this.initialWaterAreas.waterRegion;
        }
    }
       
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

    addRegion = ({ name, globalId, mapIndex }) => {
        // console.log('clicked:', name, globalId, mapIndex);
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props;
        // const waterObject = assessment.artskartWaterModel.isWaterArea ? this.initialWaterAreas.areaState[globalId] : this.initialWaterAreas.regionState[globalId];
        const waterObject = assessment.artskartWaterModel.areas.find(x => x.globalId === globalId);

        if (waterObject && !waterObject.disabled) {
            const currentState = mapOlFunc.convertMapIndex2State(mapIndex);
            const areaValue = waterObject[`state${currentState}`] === 0 ? 1 : 0;
            waterObject[`state${currentState}`] = areaValue;
            if (areaValue === 1) {
                waterObject.state2 = 0;
                switch (currentState) {
                    case 0:
                        waterObject.state1 = 1;
                    case 1:
                        waterObject.state3 = 1;
                }
            } else if (waterObject.state0 === 0 && waterObject.state1 === 0 && waterObject.state3 === 0) {
                waterObject.state2 = 1;
            }
            this.waterIsChanged++;
        }
    }

    handleWaterCheck = ({waterObject, state, value}) => {
        // console.log('handleWaterCheck', waterObject, state, value)
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props;
        const area = assessment.artskartWaterModel.areas.find(x => x.globalId === waterObject.globalId);
        if (area) {
            area.state0 = waterObject.state0;
            area.state1 = waterObject.state1;
            area.state2 = waterObject.state2;
            area.state3 = waterObject.state3;
        }
        this.waterIsChanged++;
    }

    handleOverførFraSimpleMap = ({selectedItems, newIsWaterArea}) => {
        // console.log('handleOverførFraSimpleMap', selectedItems);
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props;
        // console.log('handleOverførFraSimpleMap', assessment.artskartWaterModel.isWaterArea, newIsWaterArea);
        if (assessment.artskartWaterModel.isWaterArea != newIsWaterArea) assessment.artskartWaterModel.areas = undefined;
        assessment.artskartWaterModel.isWaterArea = newIsWaterArea;
        this.reCreateartskartWaterModelArea({ ass: assessment, initialWaterAreas: this.initialWaterAreas });
        const deSelectArea = (area) => {
            area.disabled = 1;
            area.selected = 0;
            area.state0 = 0;
            area.state1 = 0;
            area.state2 = 1;
            area.state3 = 0;
        };
        assessment.artskartWaterModel.areas.forEach(area => {
            if (selectedItems) {
                if (selectedItems.indexOf(area.globalId) < 0) {
                    deSelectArea(area);
                } else {
                    area.disabled = 0;
                    area.selected = 1;
                }
            } else {
                deSelectArea(area);
            }
        });

        this.selectedWaterArea = assessment.artskartWaterModel.areas
        .filter(x => x.disabled === 0)
        .map(x => x.globalId);
    }

    handleOverførFraArtskart = ({ selectionGeometry, countylist, newWaterAreas, areadata, observations, editStats }) => {
        // console.log('handleOverførFraArtskart', selectionGeometry, countylist, areadata, observations, editStats);
        // console.log('handleOverførFraArtskart', newWaterAreas);
        const aps = this.props.appState;
        const ass = aps.assessment;

        if (ass.isAlienSpecies && ass.isRegionallyAlien) {
            // console.log('working with vannområder...', areadata, newWaterAreas);
            if (newWaterAreas) {
                newWaterAreas.forEach(x => {
                    const area = ass.artskartWaterModel.areas.find(a => a.globalId === x.globalId);
                    if (area) {
                        area.state0 = x.intersects ? 1 : 0;
                        area.state1 = x.intersects ? 1 : 0;
                        area.state2 = !x.intersects ? 1 : 0;
                        area.state3 = x.intersects ? 1 : 0;
                    }
                });
                this.selectedWaterArea = ass.artskartWaterModel.areas
                .filter(x => x.disabled === 0)
                .map(x => x.globalId);
                this.waterIsChanged++;
            }
        }

        ass.riskAssessment.AOOknown = areadata.AreaExtentOfOccurrence;
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
                        {!this.initialWaterAreas && assessment.isAlienSpecies && assessment.isRegionallyAlien &&
                            <>
                                <h4>Vurderingsområde <i>(beta)</i></h4>
                                <div style={{marginLeft: 20, marginBottom: 30}}>...henter vannregioner og vannområder</div>
                            </>
                        }
                        {this.initialWaterAreas && assessment.isAlienSpecies && assessment.isRegionallyAlien &&
                        <>
                            <h4>Vurderingsområde <i>(beta)</i></h4>
                            <div style={{marginLeft: 20, marginBottom: 30}}>
                                <ModalSimpleMap
                                    evaluationContext={assessment.evaluationContext}
                                    labels={labels}
                                    artskartWaterModel={assessment.artskartWaterModel}
                                    isWaterArea={assessment.artskartWaterModel.isWaterArea}
                                    initialWaterAreas={this.initialWaterAreas}
                                    onOverførFraSimpleMap={action(this.handleOverførFraSimpleMap)}
                                />
                            </div>
                        </>
                        }
                        <h4>Forekomstareal</h4>
                        {assessment.alienSpeciesCategory == "DoorKnocker" ? 
                        <div>
                            <div className="statusField">
                                <div className="labels distribution">
                                    <p>Hvor mange 2 x 2 km-ruter kan arten kolonisere i løpet av en 10 års-periode basert på én introduksjon til norsk natur? (Innenfor vurderingsperioden på 50 år)?</p>
                                    <p>Hvor mange ytterligere introduksjoner til norsk natur antas arten å få i løpet av samme 10-års periode?</p>
                                    <p>Totalt forekomstareal <b> 10 år etter første introduksjon </b> (km<sup>2</sup>)</p>
                                    
                                </div>
                                <div className="distribution">
                                    <DistributionTable/>
                                </div>
                            </div>
                            <div className="changedNature">
                                <p>Andel av antatt forekomstareal i sterkt endra natur (%)</p>
                                <Xcomp.StringEnum observableValue={[assessment.riskAssessment, "spreadHistoryDomesticAreaInStronglyChangedNatureTypes"]} codes={koder.KnownDistributionInNature}/>
                             {/*<Xcomp.StringEnum observableValue={[assessment, "spreadAreaInChangedNature"]} codes={koder.KnownDistributionInNature}/> */}
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
                                        artskartWaterModel={assessment.artskartWaterModel}
                                        waterFeatures={this.getWaterFeatures(assessment)}
                                        labels={labels}
                                        utvalg={assessment.riskAssessment}
                                        artskartModel={assessment.artskartModel}
                                        onOverførFraArtskart={action(this.handleOverførFraArtskart)}
                                        artskartSelectionGeometry={assessment.artskartSelectionGeometry}
                                        artskartAdded={assessment.artskartAdded}
                                        artskartRemoved={assessment.artskartRemoved}
                                        unused={this.waterIsChanged}
                                    />
                                </div>
                                <p>Basert på periode:</p>
                                <div className="distributionYears">
                                    <div>
                                        <p> f.o.m. år (t<sub>0</sub>)</p> 
                                        <Xcomp.Number
                                            style={{marginLeft: 20}}
                                            // observableValue={[assessment.riskAssessment, "AOOyear1"]}
                                            // About the name of this property: Se domain!
                                            observableValue={[assessment.riskAssessment, "AOOendyear1"]}
                                            yearRange={true}/> 
                                    </div>
                                    <div>
                                        <p>t.o.m. år</p>
                                        <Xcomp.Number                            
                                            // observableValue={[assessment.riskAssessment, "AOOyear2"]}
                                            // About the name of this property: Se domain!
                                            observableValue={[assessment.riskAssessment, "AOOendyear2"]}
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
                                    
                                    {/* ToDo: Bug - speciesDistribution not found 
                                    <Xcomp.StringEnum observableValue={[assessment, "spreadAreaInChangedNature"]} codes={koder.KnownDistributionInNature}/>*/}
                                    <Xcomp.StringEnum observableValue={[assessment.riskAssessment, "spreadHistoryDomesticAreaInStronglyChangedNatureTypes"]} codes={koder.KnownDistributionInNature}/>
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
                    {!(assessment.isAlienSpecies && assessment.isRegionallyAlien) &&
                        <Fylkesforekomst
                            evaluationContext={assessment.evaluationContext}
                            taxonId={assessment.TaxonId}
                            latinsknavnId={assessment.latinsknavnId}
                            utvalg={assessment.artskartModel}
                            {...assessment.artskartModel} // Rerender hack
                            artskartModel={assessment.artskartModel}  // could replace this one?
                            fylkesforekomster={assessment.fylkesforekomster}
                            assessment={assessment}
                            disabled={appState.userContext.readonly}
                            onOverførFraArtskart={action(this.handleOverførFraArtskart)} />
                    }
                    {this.initialWaterAreas && assessment.isAlienSpecies && assessment.isRegionallyAlien &&
                    <div>
                        {this.initialWaterAreas &&
                            <WaterArea
                                assessment={assessment}
                                initialWaterAreas={this.initialWaterAreas}
                                onWaterCheck={action(this.handleWaterCheck)}
                                waterIsChanged={this.waterIsChanged}
                                />
                        }
                        <div style={{display: 'inline-flex', width: '100%'}}>
                            <div style={{width: '33%', height: 500}}>
                                <SimpleMap
                                    static={true}
                                    isWaterArea={assessment.artskartWaterModel.isWaterArea}
                                    artskartWaterModel={assessment.artskartWaterModel}
                                    waterFeatures={this.getWaterFeatures(assessment)}
                                    selectedArea={this.selectedWaterArea}
                                    mapIndex={1}
                                    waterIsChanged={this.waterIsChanged}
                                    onClick={action(this.addRegion)}
                                    evaluationContext={assessment.evaluationContext} />
                            </div>
                            <div style={{width: '33%', height: 500}}>
                                <SimpleMap
                                    static={true}
                                    isWaterArea={assessment.artskartWaterModel.isWaterArea}
                                    artskartWaterModel={assessment.artskartWaterModel}
                                    waterFeatures={this.getWaterFeatures(assessment)}
                                    selectedArea={this.selectedWaterArea}
                                    mapIndex={2}
                                    waterIsChanged={this.waterIsChanged}
                                    onClick={action(this.addRegion)}
                                    evaluationContext={assessment.evaluationContext} />
                            </div>
                            <div style={{width: '33%', height: 500}}>
                                <SimpleMap
                                    static={true}
                                    isWaterArea={assessment.artskartWaterModel.isWaterArea}
                                    artskartWaterModel={assessment.artskartWaterModel}
                                    waterFeatures={this.getWaterFeatures(assessment)}
                                    selectedArea={this.selectedWaterArea}
                                    mapIndex={3}
                                    waterIsChanged={this.waterIsChanged}
                                    onClick={action(this.addRegion)}
                                    evaluationContext={assessment.evaluationContext} />
                            </div>
                        </div>
                    </div>
                    }
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
                                    //observableValue={[assessment.riskAssessment, "populationSize"]}
                                    observableValue={[assessment, "currentIndividualCount"]}
                                    
                                    integer
                                />
                        </div>
                    </div>
                        
                </fieldset>

                {assessment.spreadHistory.length > 0 && 
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
                }
            
                    
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
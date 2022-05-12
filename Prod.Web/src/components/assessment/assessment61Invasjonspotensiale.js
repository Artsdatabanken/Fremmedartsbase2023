import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {action, computed, runInAction, observable, makeObservable, extendObservable} from 'mobx'
import * as Xcomp from './observableComponents';
import Tabs from '../tabs'
import Criterion from './criterion'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
import config from '../../config'
// import Filliste from './35Utbredelseshistorikk/Filliste'
// import FileUpload from '../FileUpload'
import Documents from '../documents'
// import { KeyboardHideSharp } from '@material-ui/icons'
// import {stringFormat} from "../../utils"
import ModalArtskart from '../artskart/ModalArtskart';
import errorhandler from '../errorhandler';
import ErrorList from '../errorList';
import { getWaterAreas } from '../water/apiWaterArea';

@inject("appState")
@observer
export default class Assessment61Invasjonspotensiale extends React.Component {
    // code looks unused, but it makes the Artskart-module listen to changes
    @computed get isDirty() {
        if (!this.props.appState.assessmentId) return false
        const a = JSON.stringify(this.props.appState.assessment)
        const b = this.props.appState.assessmentSavedVersionString
        const c = {
            observationFromYear: this.props.appState.assessment.artskartModel.observationFromYear,
            observationToYear: this.props.appState.assessment.riskAssessment.AOOyear1,
            includeNorge: this.props.appState.assessment.artskartModel.includeNorge,
            excludeObjects: this.props.appState.assessment.artskartModel.excludeObjects,
            excludeGbif: this.props.appState.assessment.artskartModel.excludeGbif,
        }
        const d = JSON.stringify(this.props.appState.virtualArtskartModel0);
        const e = {
            observationFromYear: this.props.appState.assessment.artskartModel.observationFromYear,
            observationToYear: this.props.appState.assessment.riskAssessment.AOOyear2,
            includeNorge: this.props.appState.assessment.artskartModel.includeNorge,
            excludeObjects: this.props.appState.assessment.artskartModel.excludeObjects,
            excludeGbif: this.props.appState.assessment.artskartModel.excludeGbif,
        }
        const f = JSON.stringify(this.props.appState.virtualArtskartModel);
        return a != b || c != d || e != f;
    }

    GetIsRegionalAssessment = (assessment) =>
    {
        return assessment.isAlienSpecies 
        && assessment.isRegionallyAlien 
        && assessment.expertGroup == "Fisker" 
    }

    constructor(props) {
        super();
        extendObservable(this, {
            initialWaterAreas: null,
            selectedWaterArea: [],
            waterIsChanged: 0
        });
        if (props && props.appState && props.appState.assessment) {
            const assessment = props.appState.assessment;
            if (this.GetIsRegionalAssessment(assessment)) {
                if (assessment.artskartWaterModel === null) assessment.artskartWaterModel = {};
                if (this.initialWaterAreas === null && this.GetIsRegionalAssessment(assessment)) {
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
    handleDateFromArtskart0 = ({ selectionGeometry, countylist, newWaterAreas, areadata, observations, editStats }) => {
        console.log('ToDo: data from Artskart - 0', areadata);
        const aps = this.props.appState;
        const ass = aps.assessment;
        ass.riskAssessment.AOOknown1 = areadata.AreaOfOccupancy;
        ass.riskAssessment.AOOyear1 = this.props.appState.virtualArtskartModel0.observationToYear;
    }
    handleDateFromArtskart1 = ({ selectionGeometry, countylist, newWaterAreas, areadata, observations, editStats }) => {
        console.log('ToDo: data from Artskart - 1', areadata);
        const aps = this.props.appState;
        const ass = aps.assessment;
        ass.riskAssessment.AOOknown2 = areadata.AreaOfOccupancy;
        ass.riskAssessment.AOOyear2 = this.props.appState.virtualArtskartModel.observationToYear;
    }
    getWaterFeatures = (assessment) => {
        if (this.initialWaterAreas && assessment && assessment.artskartWaterModel) {
            return assessment.artskartWaterModel.isWaterArea ? this.initialWaterAreas.waterArea : this.initialWaterAreas.waterRegion;
        }
    }
    render() {
        const renderAgain = this.isDirty; // code looks unused, but it makes the Artskart-module listen to changes
        const {appState:{assessment, assessment:{riskAssessment}}, appState:{riskAssessmentTabs}, appState, } = this.props;

        const labels = appState.codeLabels
        const labelsArtskart = appState.codeLabels.DistributionHistory
        const koder = appState.koder
        const disabled = appState.userContext.readonly
        // const ntLabels = labels.NatureTypes
        if (assessment.artskartModel) {
            this.props.appState.virtualArtskartModel0 = this.props.appState.virtualArtskartModel0 || observable({
                observationFromYear: assessment.artskartModel.observationFromYear,
                observationToYear: assessment.riskAssessment.AOOyear1,
                includeNorge: assessment.artskartModel.includeNorge,
                excludeObjects: assessment.artskartModel.excludeObjects,
                excludeGbif: assessment.artskartModel.excludeGbif,
            });        
                this.props.appState.virtualArtskartModel = this.props.appState.virtualArtskartModel || observable({
                observationFromYear: assessment.artskartModel.observationFromYear,
                observationToYear: assessment.riskAssessment.AOOyear2,
                includeNorge: assessment.artskartModel.includeNorge,
                excludeObjects: assessment.artskartModel.excludeObjects,
                excludeGbif: assessment.artskartModel.excludeGbif,
            });
        }

        const critA = riskAssessment.critA
        const critB = riskAssessment.critB
        const critC = riskAssessment.critC
        // const textAS = riskAssessment.a1aresulttext
        const textDK = riskAssessment.a1bresulttext
        const textASB = riskAssessment.b2aresulttext
        const textDKB = riskAssessment.b2bresulttext
        const nbsp = "\u00a0"

        const presentValue = (f) => f === "" ? <span>᠆᠆᠆᠆᠆</span> : f

        const AOO1error = errorhandler.errors["(a)err7"]
        const AOO1warn = errorhandler.warnings["(a)warn2"]
        const AOO2error = errorhandler.errors["(a)err8"]
        const AOO2warn = errorhandler.warnings["(a)warn3"]

        return (
            <div>
                {config.showPageHeaders
                ? <h3>Invasjonspotensiale</h3>
                : <br/>}
                <div> 
                    <fieldset className="well">
                        <h2>{labels.Acrit.mainHeading}</h2>
                        <h4>{critA.heading}</h4>
                        <p>{critA.info}</p>
                        
                        <Xcomp.StringEnum mode="radio" observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]} codes={koder.AcritSelect} /> 
                        {riskAssessment.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" 
                        ? <div>

                            {assessment.isDoorKnocker 
                            ? <p dangerouslySetInnerHTML={{ __html: textDK}}></p> 
                            : <p dangerouslySetInnerHTML={{ __html: riskAssessment.a1aresulttext}}></p>}
                            <Xcomp.StringEnum observableValue={[riskAssessment, "acceptOrAdjustCritA"]} mode="radio" codes={koder.AcceptOrAdjust}/>   
                                            
                            <ErrorList errorhandler={errorhandler} errorids={["(a)err25", "(a)err27"]} />            
                            <div className="adjustScore">
                                {riskAssessment.acceptOrAdjustCritA == "adjust" &&                                
                                    <Xcomp.HtmlString observableValue={[riskAssessment, 'reasonForAdjustmentCritA']} label="Begrunnelse for justering (obligatorisk):" />
                                }
                            </div> 
                            
                        </div>      
                        : riskAssessment.chosenSpreadMedanLifespan == "SpreadRscriptEstimatedSpeciesLongevity" 
                        ? <div>
                            <div className="statusField"> 
                                <div className="labels">
                                    <p>{labels.Acrit.speciesCount}</p>
                                    <p>{labels.Acrit.populationGrowth}</p>
                                    <p>{labels.Acrit.environmantVariance}</p>
                                    <p>{labels.Acrit.demographicVariance}</p>
                                    <p>{labels.Acrit.sustainability}</p>
                                    <p>{labels.Acrit.extinctionThreshold}</p>
                                </div>
                                <div className="numberFields">
                                    <Xcomp.Number observableValue={[riskAssessment, "populationSize"]} disabled={disabled} integer />  
                                    <Xcomp.Number observableValue={[riskAssessment, "growthRate"]} disabled={disabled}/>  
                                    <Xcomp.Number observableValue={[riskAssessment, "envVariance"]} disabled={disabled}/>  
                                    <Xcomp.Number observableValue={[riskAssessment, "demVariance"]} disabled={disabled}/>  
                                    <Xcomp.Number observableValue={[riskAssessment, "carryingCapacity"]} disabled={disabled} integer />  
                                    <Xcomp.Number observableValue={[riskAssessment, "extinctionThreshold"]} disabled={disabled} integer />  
                                </div>
                            </div>
                            <a href="http://www.evol.no/hanno/11/levetid.htm" target="_blank">{labels.Acrit.rScriptLongevity}</a>
                            <div className="statusField">
                                <div className="labels">
                                    <p>{labels.Acrit.median}</p> 
                                </div>
                                <div className="numberFields">
                                    <Xcomp.Number observableValue={[riskAssessment, "medianLifetimeInput"]} disabled={disabled} integer />  
                                </div>
                            </div>
                        </div> 
                        : riskAssessment.chosenSpreadMedanLifespan == "ViableAnalysis" 
                        ? <div>
                            <p>{labels.Acrit.PVAAnalysis}</p>
                            <Xcomp.HtmlString observableValue={[riskAssessment, 'spreadPVAAnalysis']} />
                            <hr></hr>  
                            <div>                       
                                <Documents/>
                            </div>
                            <div className="statusField">
                                <div className="labels" style={{width: "100px"}}>
                                    <p>{labels.Acrit.median}</p>
                                    <p>{labels.Acrit.lower}</p>
                                    <p>{labels.Acrit.upper}</p>
                                </div>
                                <div className="numberFields">                  
                                    <Xcomp.Number observableValue={[riskAssessment, "medianLifetimeInput"]} observableErrors={[errorhandler, "A3err1", "A3err2"]} integer />  {/* ACritMedianLifespan */}
                                    <Xcomp.Number observableValue={[riskAssessment, "lifetimeLowerQInput"]} observableErrors={[errorhandler, "A3err1"]} integer />  
                                    <Xcomp.Number observableValue={[riskAssessment, "lifetimeUpperQInput"]} observableErrors={[errorhandler, "A3err2"]} integer />                     
                                </div>
                            </div>
                        </div> 
                        : riskAssessment.chosenSpreadMedanLifespan_Was_RedListCategoryLevel 
                        ? <p><b>Den utgåtte metoden c) Rødlistekriterier var brukt på A-kriteriet for denne arten i 2018. Det resulterte i skår {riskAssessment.roAscore2018 + 1} på A-kriteriet.</b></p>
                        : null }

                        {riskAssessment.chosenSpreadMedanLifespan != "RedListCategoryLevel" && riskAssessment.chosenSpreadMedanLifespan != "" 
                            ? <Criterion criterion={critA} 
                                appState={appState}
                                mode="noheading"
                                disabled = {disabled || (riskAssessment.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" && riskAssessment.acceptOrAdjustCritA == "accept")}
                            />
                            : null}
                    </fieldset>
                    <br/>
                    <fieldset className="well">
                        <h4>{critB.heading}</h4>
                        <p>{critB.info}</p>
                        <Xcomp.Radio
                                    label={labels.BcritSelect.a}
                                    value={"a"}
                                    disabled={disabled}
                                    observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                        
                        <Xcomp.Radio
                                    label={labels.BcritSelect.b}
                                    value={"b"}
                                    disabled={disabled}
                                    observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                        <ErrorList errorhandler={errorhandler} errorids={["(a)err26"]} />            
                    

                        {riskAssessment.chosenSpreadYearlyIncrease == "a" 
                        ? <div> 
                            <p> {labels.BcritText.enterParameters}<i>{labels.BcritText.standartSettings}</i></p>
                            <div className="statusField"> 
                                <div className="labels">
                                    <p>{labels.Bcrit.mCount}</p>
                                    <p>{labels.Bcrit.model}</p>
                                    <p>{labels.Bcrit.occurrencesListed}</p>
                                </div>
                                <div className="numberFields">
                                    {/*pattern={"^[0-9]+(\\.\\d+)(\\-\\d+(\.\d+))"}*/}
                                    <Xcomp.String                            
                                                observableValue={[riskAssessment, "bCritMCount"]}
                                                placeholder={""}
                                                disabled={disabled}
                                            />  
                                    <Xcomp.StringEnum                            
                                                observableValue={[riskAssessment, "bCritModel"]}
                                                //placeholder={"false"}
                                                codes={koder.BCritMod}
                                            />  
                                    <Xcomp.StringEnum                            
                                                observableValue={[riskAssessment, "bCritOccurrences"]}
                                                codes={koder.BCritOccList}
                                            /> 
                                </div>
                            </div>

                            <a href="https://view.nina.no/expansion/" target="_blank">{labels.Bcrit.rScriptExpansion}</a>
                            <div className="statusField">
                                <div className="labelsB">
                                    <p>{labels.Bcrit.expansion}</p> 
                                    <p>{labels.Bcrit.lower}</p> 
                                    <p>{labels.Bcrit.higher}</p> 
                                </div>
                                <div className="numberFieldsB">
                                <Xcomp.Number                            
                                            observableValue={[riskAssessment, "expansionSpeedInput"]} 
                                            observableErrors={[errorhandler, "B1err1", "B1err2"]} 
                                            integer
                                            disabled={disabled}
                                        />  
                                    <Xcomp.Number                            
                                            observableValue={[riskAssessment, "expansionLowerQInput"]}
                                            observableErrors={[errorhandler, "B1err1"]} 
                                            integer
                                            disabled={disabled}
                                        />  
                                    <Xcomp.Number                            
                                            observableValue={[riskAssessment, "expansionUpperQInput"]}
                                            observableErrors={[errorhandler, "B1err2"]} 
                                            integer
                                            disabled={disabled}
                                        />  
                                </div>
                            </div>
                            <hr/>                    
                            <div>
                                <Documents/>
                            </div>
                            <br/>
                        </div> 
                        : riskAssessment.chosenSpreadYearlyIncrease == "b" && assessment.isDoorKnocker 
                        ? <div>
                            <p>{textDKB}</p>
                        </div> 
                        : riskAssessment.chosenSpreadYearlyIncrease == "b" 
                        ? <div>
                            <hr />
                            {/* <p>Er artens første forekomst i norsk natur fra år 2012 eller senere?</p> */}
                            <p>Det anbefales at ekspansjonshastigheten estimeres med utgangspunkt i kjent forekomstareal ved to ulike år der perioden fra t<sub>1</sub>  til og med år t<sub>2</sub> er på minimum 10 år. Hvis artens første forekomst i norsk natur er fra 2012 eller senere, eller perioden er mindre enn 10 år av andre årsaker, vil ekspansjonshastigheten beregnes med utgangspunkt i beste anslag på forekomstarealet i dag og om 50 år (hentet fra Utbredelse i Norge). Er perioden på minimum 10 år?</p>
                            <Xcomp.StringEnum 
                                mode="radio"
                                observableValue={[riskAssessment, "AOOfirstOccurenceLessThan10Years"]} 
                                codes={koder.yesNo}
                            />                  
                            {riskAssessment.AOOfirstOccurenceLessThan10Years === "yes"
                            ? <>
                                <p style={{marginTop: "10px", marginBottom: "20px", paddingTop: "20px"}} dangerouslySetInnerHTML={{__html: labels.BcritText.SelfProducing}}></p>
                                    
                                <table className="table BCritTable">
                                    <thead>
                                        <tr>     
                                            <th></th>                                           
                                            <th dangerouslySetInnerHTML={{ __html: labels.Bcrit.fromYear }}></th>
                                            <th dangerouslySetInnerHTML={{ __html: labels.Bcrit.toYear}}></th>
                                            <th dangerouslySetInnerHTML={{ __html: labels.Bcrit.km2}}></th> 
                                            <th dangerouslySetInnerHTML={{ __html: labels.Bcrit.km2withoutConsideration}}></th>                                                  
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(AOO1error || AOO1warn)
                                        ? <tr>
                                            <td colspan="5">
                                                {AOO1error 
                                                ? <b style={{ color: "red" }}>{AOO1error}</b> 
                                                : <b style={{ color: "orange" }}> {AOO1warn}</b>}
                                            </td>
                                        </tr>
                                        : null}
                                        <tr>
                                            <td>
                                                <div style={{marginBottom: 10}}>
                                                    <ModalArtskart
                                                        taxonId={assessment.taxonId}
                                                        scientificNameId={assessment.evaluatedScientificNameId}
                                                        evaluationContext={assessment.evaluationContext}
                                                        showWaterAreas={this.GetIsRegionalAssessment(assessment)}
                                                        artskartWaterModel={assessment.artskartWaterModel}
                                                        waterFeatures={this.getWaterFeatures(assessment)}
                                                        labels={labelsArtskart}
                                                        utvalg={assessment.riskAssessment}
                                                        artskartModel={this.props.appState.virtualArtskartModel0}
                                                        onOverførFraArtskart={action(this.handleDateFromArtskart0)}
                                                        artskartSelectionGeometry={assessment.artskartSelectionGeometry}
                                                        artskartAdded={assessment.artskartAdded}
                                                        artskartRemoved={assessment.artskartRemoved}
                                                        showTransferRegionlist={false}
                                                    />
                                                </div>
                                            </td>
                                            <td> 
                                                <Xcomp.Number       
                                                    disabled 
                                                    className={"BcritYear"}                    
                                                    observableValue={[riskAssessment, "AOOendyear1"]} 
                                                    integer 
                                                /> 
                                            </td>
                                            <td style={{display: 'flex'}}><Xcomp.Number                            
                                                    observableValue={[riskAssessment, "AOOyear1"]}
                                                    observableErrors={[errorhandler, "B2err1"]}
                                                    integer
                                                    className={"BcritYear"}
                                                    yearRange={true}
                                            /> 
                                                <span style={{margin: '10px 10px 0'}}>(t<sub>1</sub>)</span>
                                            </td>
                                            <td>
                                                <Xcomp.Number                            
                                                    observableValue={[riskAssessment, "AOOknown1"]}
                                                    integer
                                                    disabled={!riskAssessment.notUseSpeciesMap}
                                                />
                                            </td>
                                            <td>
                                                <Xcomp.Number                            
                                                    observableValue={[riskAssessment, "AOO1"]}
                                                    observableErrors={[errorhandler, "(a)err7", "(a)err9"]}
                                                    integer
                                                />
                                            </td>
                                        </tr>
                                        {AOO2error || AOO2warn 
                                        ? <tr>
                                            <td colspan="5">
                                                {AOO2error 
                                                ? <b style={{ color: "red" }}>{AOO2error}</b> 
                                                : <b style={{ color: "orange" }}> {AOO2warn}</b>}
                                            </td>
                                        </tr>
                                        : null}
                                        <tr>
                                            <td>
                                                <div style={{marginBottom: 10}}>
                                                    <ModalArtskart
                                                        taxonId={assessment.taxonId}
                                                        scientificNameId={assessment.evaluatedScientificNameId}
                                                        evaluationContext={assessment.evaluationContext}
                                                        showWaterAreas={this.GetIsRegionalAssessment(assessment)}
                                                        artskartWaterModel={assessment.artskartWaterModel}
                                                        waterFeatures={this.getWaterFeatures(assessment)}
                                                        labels={labelsArtskart}
                                                        utvalg={assessment.riskAssessment}
                                                        artskartModel={this.props.appState.virtualArtskartModel}
                                                        onOverførFraArtskart={action(this.handleDateFromArtskart1)}
                                                        artskartSelectionGeometry={assessment.artskartSelectionGeometry}
                                                        artskartAdded={assessment.artskartAdded}
                                                        artskartRemoved={assessment.artskartRemoved}
                                                        showTransferRegionlist={false}
                                                    />
                                                </div>
                                            </td>
                                            <td> 
                                                <Xcomp.Number   
                                                    disabled                         
                                                    observableValue={[riskAssessment, "AOOendyear1"]}
                                                    className={"BcritYear"}
                                                    integer
                                                    yearRange={true}/> 
                                            </td>
                                            <td style={{display: 'flex'}}>
                                                <Xcomp.Number            
                                                    className={"BcritYear"}
                                                    observableValue={[riskAssessment, "AOOyear2"]} 
                                                    observableErrors={[errorhandler, "B2err1"]}
                                                    integer
                                                    yearRange={true}
                                                /> 
                                                <span style={{margin: '10px 10px 0'}}>(t<sub>2</sub>)</span>
                                            </td>
                                            <td>
                                                <Xcomp.Number observableValue={[riskAssessment, "AOOknown2"]} integer disabled={!riskAssessment.notUseSpeciesMap} /> 
                                            </td> 
                                            <td>    
                                                <Xcomp.Number                            
                                                    observableValue={[riskAssessment, "AOO2"]}
                                                    observableErrors={[errorhandler, "(a)err8"]}
                                                    integer
                                                />
                                            </td>                                               
                                        </tr>
                                    </tbody>                            
                                </table>
                                <ErrorList errorhandler={errorhandler} errorids={["(a)err7","(a)err8","(a)err9","(a)err10", "B2err1"]} />
                                <Xcomp.Bool observableValue={[riskAssessment, "notUseSpeciesMap"]} label={"Ønsker ikke å bruke Artskart for å beregne forekomstareal"} />
                                <p>{labels.Bcrit.commentOrDescription}</p>
                                <Xcomp.HtmlString  observableValue={[riskAssessment, "commentOrDescription"]} />                      
                            </>
                            : null }
                            <p dangerouslySetInnerHTML={{ __html: textASB}}></p>
                        </div> 
                        : null}
                        {riskAssessment.chosenSpreadYearlyIncrease != "SpreadYearlyLiteratureData" && riskAssessment.chosenSpreadYearlyIncrease != "SpreadYearlyIncreaseCalculatedExpansionSpeed" && riskAssessment.chosenSpreadYearlyIncrease != "SpreadYearlyIncreaseObservations" && riskAssessment.chosenSpreadYearlyIncrease != "" 
                        ? <div
                            style={{
                                display: "inline-block",
                                marginTop: "10px"
                            }}>
                            <Criterion criterion={critB} appState={appState} mode="noheading"/>
                        </div>
                        : null}
                       
                        {riskAssessment.activeSpreadYearlyLiteratureData
                        ? <div className="previousAssessment">
                            <table className="formtable Bcrit">
                                <p>{labels.BcritText.transferredFrom2018}</p>  
                                <tbody>
                                    <tr>
                                        <th colSpan="4">{labels.BcritText.transferredFromB}</th>
                                    </tr>
                                    <tr>
                                        <label htmlFor="spreadYearlyLiteratureDataAssumptions">{labels.Bcrit.literatureDataAssumptions}</label>
                                        <Xcomp.HtmlString
                                            disabled={true}
                                            observableValue={[riskAssessment, 'spreadYearlyLiteratureDataSource']}
                                        />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        : null}
                        {riskAssessment.activeSpreadYearlyIncreaseCalculatedExpansionSpeed
                        ? <div className="previousAssessment">
                            <table className="formtable">
                                {!riskAssessment.activeSpreadYearlyLiteratureData  
                                ? <p>{labels.BcritText.transferredFrom2018}</p>
                                : null}
                                <tbody>
                                    <tr>
                                        <th colSpan="2">{labels.BcritText.transferredFromC}</th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label htmlFor="spreadYearlyIncreaseEstimate">{labels.Bcrit.yearlyIncrease}</label>
                                        </td>
                                        <td>
                                            <Xcomp.String
                                                disabled={true}
                                                observableValue={[riskAssessment, 'spreadYearlyIncreaseEstimate']}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label htmlFor="spreadYearlyIncreaseEstimateDescription">{labels.Bcrit.estimateDescription}</label>
                                        </td>
                                        <td>
                                            <Xcomp.HtmlString
                                                disabled={true}
                                                observableValue={[riskAssessment, 'spreadYearlyIncreaseEstimateDescription']}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>{labels.Bcrit.expansionSpeed}</label>
                                        </td>
                                        <td>
                                            <b>{presentValue(riskAssessment.spreadYearlyIncreaseCalculatedExpansionSpeed)}</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        : null}
                    </fieldset>
                    <fieldset className="well">
                        <h4>{critC.heading}</h4>
                        <p>{critC.info}</p>
                        <Criterion criterion={critC} mode="noheading" disabled={true} appState={appState}/>
                    </fieldset>
                </div>
            </div>
        );
    }
}

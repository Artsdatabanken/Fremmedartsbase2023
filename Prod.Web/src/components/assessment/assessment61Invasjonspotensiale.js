import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {action, computed, runInAction, observable, makeObservable} from 'mobx'
import * as Xcomp from './observableComponents';
import Tabs from '../tabs'
import Criterion from './criterion'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
//import ScoreUnsure from './51Naturtyper/scoreUnsure';
import config from '../../config'
// import {codes2labels, getCriterion} from '../../utils'
import Filliste from './35Utbredelseshistorikk/Filliste'
import FileUpload from '../FileUpload'
import Documents from '../documents'
import { KeyboardHideSharp } from '@material-ui/icons'
import {stringFormat} from "../../utils"
import ModalArtskart from '../artskart/ModalArtskart';
import errorhandler from '../errorhandler';

@inject('appState')
@observer
class SelectableRadio extends React.Component {
    // shouldComponentUpdate() {
    //     return true
    // }
    render() {
        const [obj, prop] = this.props.observableValue
        // console.log("Selectable" + this.props.value) console.log(" - - " +
        // obj["Selectable" + this.props.value])
        const val = this.props.value
        // const activeVal =  disabled ? "" : val
        //const disabled = !obj["Selectable" + val] || this.context.readonly
        //const disabled = false
        const disabled = this.props.disabled
        const label = this.props.label + (obj[val]
            ? "  (" + obj[val] + ")"
            : "")
        const dummy = obj[prop]
        // console.log("dummy:" + dummy) console.log(">" + prop + " (" + obj[prop] + ")
        // " + val  )
        return <div className="radio" key={val}>
            <label className={disabled
                ? "disabled"
                : ""}><input
                type="radio"
                name={"radio" + prop}
                value={val}
                checked={obj[prop] === val}
                disabled={disabled}
                onChange={action((e) => obj[prop] = e.currentTarget.value)}/>{label}</label>
        </div>
    }
}

// SelectableRadio.contextTypes = {
//     readonly: PropTypes.bool
// }

// return <Xcomp.Radio         label={this.props.label + (obj[val] ? "  (" +
// obj[val] + ")" : "")}         value={val}         observableValue={[obj,
// prop]}         disabled={disabled}         dummy={dummy} />

@inject("appState")
@observer
export default class Assessment61Invasjonspotensiale extends React.Component {
    // code looks unused, but it makes the Artskart-module listen to changes
    @computed get isDirty() {
        if (!this.props.appState.assessmentId) return false
        const a = JSON.stringify(this.props.appState.assessment)
        const b = this.props.appState.assessmentSavedVersionString
        return a != b
    }
    GetIsRegionalAssessment = (assessment) =>
    {
        return assessment.isAlienSpecies 
        && assessment.isRegionallyAlien 
        && assessment.expertGroup == "Fisker" 
    }
    // getCriterion(riskAssessment, akse, letter) {     const result =
    // riskAssessment.criteria.filter(c => c.akse === akse && c.criteriaLetter ===
    // letter)[0];     return result; }
    handleDateFromArtskart0 = ({ selectionGeometry, countylist, newWaterAreas, areadata, observations, editStats }) => {
        console.log('ToDo: data from Artskart - 0', areadata);
        const aps = this.props.appState;
        const ass = aps.assessment;
        // assessment.riskAssessment.AOOyear1
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
    render() {
        const renderAgain = this.isDirty; // code looks unused, but it makes the Artskart-module listen to changes
        const {appState:{assessment, assessment:{riskAssessment}}, appState:{riskAssessmentTabs}, appState, } = this.props;

        // const labels = appState.kodeLabels
        const labels = appState.codeLabels
        const labelsArtskart = appState.codeLabels.DistributionHistory
        // console.log('labels', labelsArtskart)
        const koder = appState.koder
        const disabled = appState.userContext.readonly
        const ntLabels = labels.NatureTypes

        const existenceArea35 = assessment.CurrentExistenceAreaCalculated

        // riskAssessment.AOO1 == null ? riskAssessment.AOO1 = riskAssessment.AOOknown1 : riskAssessment.AOO1 = 0

        // riskAssessment.AOO2 == null ? riskAssessment.AOO2 = riskAssessment.AOOknown2 : riskAssessment.AOO2 = 0

        this.props.appState.virtualArtskartModel0 = observable({
            observationFromYear: assessment.artskartModel.observationFromYear,
            observationToYear: assessment.riskAssessment.AOOyear1,
            includeNorge: assessment.artskartModel.includeNorge,
            excludeObjects: assessment.artskartModel.excludeObjects,
            excludeGbif: assessment.artskartModel.excludeGbif,
        });        
        this.props.appState.virtualArtskartModel = observable({
            observationFromYear: assessment.artskartModel.observationFromYear,
            observationToYear: assessment.riskAssessment.AOOyear2,
            includeNorge: assessment.artskartModel.includeNorge,
            excludeObjects: assessment.artskartModel.excludeObjects,
            excludeGbif: assessment.artskartModel.excludeGbif,
        });

        // commented this out. it crashed the application.
        // if (assessment.artskartModel2 === undefined) {
        //     // ToDo: Not completed yet...
        //     assessment.artskartModel2 = {
        //         observationFromYear: assessment.artskartModel.observationFromYear,
        //         observationToYear: assessment.artskartModel.observationToYear,
        //         includeNorge: assessment.artskartModel.includeNorge,
        //         excludeObjects: assessment.artskartModel.excludeObjects,
        //         excludeGbif: assessment.artskartModel.excludeGbif,
        //     };
        // }
        // if  (assessment.riskAssessment.AOOyear2 === undefined || assessment.riskAssessment.AOOyear2 == null) assessment.riskAssessment.AOOyear2 = assessment.artskartModel.observationToYear;
        // if  (assessment.riskAssessment.AOOknown2 === undefined || assessment.riskAssessment.AOOknown2 == null) assessment.riskAssessment.AOOknown2 = assessment.riskAssessment.AOOknownInput;   

        // const bassertpaValues = [
        //     {
        //         Value: "Counting",
        //         Text: "Telling"
        //     }, {
        //         Value: "Estimated",
        //         Text: "Estimert"
        //     }, {
        //         Value: "MinimumEstimate",
        //         Text: "Minimumsanslag"
        //     }
        // ];
        // const critA = getCriterion(riskAssessment, 0, "A")
        // const critB = getCriterion(riskAssessment, 0, "B")
        // const critC = getCriterion(riskAssessment, 0, "C")
        const critA = riskAssessment.critA
        const critB = riskAssessment.critB
        const critC = riskAssessment.critC
        const textAS = riskAssessment.a1aresulttext
        console.log(textAS)
        //stringFormat(labels.AcritText.SelfProducing)
        const textDK = riskAssessment.a1bresulttext
        
        //stringFormat(labels.AcritText.DoorKnocker)
        const textASB = riskAssessment.b2aresulttext
        //stringFormat(labels.BcritText.SelfProducing)
        const textDKB = riskAssessment.b2bresulttext
        //stringFormat(labels.BcritText.DoorKnocker)

        const nbsp = "\u00a0"

        const presentValue = (f) => f === "" ? <span>᠆᠆᠆᠆᠆</span> : f

        // &#11834;
        // <h5>** Invasjonspotensiale nivå: {appState.invasjonspotensialeLevel.level + 1}
        // **</h5> <h5>** Utslagsgivende kriterier:
        // {appState.invasjonspotensialeLevel.decisiveCriteria.map(crit =>
        // crit.criteriaLetter).sort().join()} **</h5> <h5>** usikkerhet:
        // {appState.invasjonspotensialeLevel.uncertaintyLevels.slice().join(';')}
        // **</h5>**</h5>

        const AOO1error = errorhandler.errors["(a)err7"]
        const AOO1warn = errorhandler.warnings["(a)warn2"]
        const AOO2error = errorhandler.errors["(a)err8"]
        const AOO2warn = errorhandler.warnings["(a)warn3"]

        return (
            <div>
                {config.showPageHeaders
                    ? <h3>Invasjonspotensiale</h3>
                    : <br/>}
                {
                riskAssessmentTabs.activeTab.id === 2  ?
                <Assessment62Okologiskeffekt/> :
                <div> 
                <fieldset className="well">
                    <h2>{labels.Acrit.mainHeading}</h2>
                    <h4>{critA.heading}</h4>
                    <p>{critA.info}</p>
                    
                    {/* <Xcomp.StringEnum observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]} mode="radio" codes={codes.HorizonEstablismentPotential}/> */}
                    
                    
                     <Xcomp.StringEnum mode="radio" observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]} codes={koder.AcritSelect} /> 
                   {/* <SelectableRadio
                            label={labels.AcritSelect.LifespanA1aSimplifiedEstimate}
                            value={"LifespanA1aSimplifiedEstimate"}
                            observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                    <SelectableRadio
                            label={labels.AcritSelect.SpreadRscriptEstimatedSpeciesLongevity}
                            value={"SpreadRscriptEstimatedSpeciesLongevity"}
                            observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                    <SelectableRadio
                            label={labels.AcritSelect.ViableAnalysis}
                            value={"ViableAnalysis"}
                            observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>*/}
                    {riskAssessment.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" ? 
                        <div>

                        {assessment.alienSpeciesCategory == "DoorKnocker" ? 
                        <p>{textDK}
                           </p> :
                        <p 
                        /*dangerouslySetInnerHTML={{
                            __html: riskAssessment.a1aresulttext
                        }}*/
                         >  {riskAssessment.a1aresulttext}</p>}

                        <Xcomp.StringEnum observableValue={[riskAssessment, "acceptOrAdjustCritA"]} mode="radio" codes={koder.AcceptOrAdjust}/>   
                                         
                                            
                        <div className="adjustScore">
                            {riskAssessment.acceptOrAdjustCritA == "adjust" &&                                
                                <Xcomp.HtmlString observableValue={[riskAssessment, 'reasonForAdjustmentCritA']} label="Begrunnelse for justering:" />
                            }

                            {/* <ScoreUnsure appState={appState}
                                    critScores={koder.scoresA}
                                    firstValue={"scoreA"}
                                    secondValue={"unsureA"}/> */}
                        </div> 
                            {/* : 
                            <div>
                                <p>{ntLabels.scoreSummary}</p>
                                <ScoreUnsure appState={appState}
                                        critScores={koder.scoresA}                                                        
                                        disabled={"false"}
                                        firstValue={"scoreA"}
                                        secondValue={"unsureA"}/>
                                </div> } */}
                           
                        </div>      
                        // : 
                        // <div>
                        //     <p>Basert på de beste anslagene på forekomstareal i dag ([X1] km2) og om 50 år ([X2] km2) er A-kriteriet forhåndsskåret som [X3] (med usikkerhet: [X4-X5]). 
                        //         Dette innebærer at artens mediane levetid ligger [mellom X6 år og X7 år], eller at sannsynligheten for utdøing innen 50 år er på [mellom X8 % og X9 %].</p>
                        //     <Xcomp.StringEnum observableValue={[riskAssessment, "acceptOrAdjustCritA"]} mode="radio" codes={koder.AcceptOrAdjust}/>   

                        //     {riskAssessment.acceptOrAdjustCritA == "b" ? 
                        //                     <div>
                        //                         <Xcomp.HtmlString observableValue={[riskAssessment, 'reasonForAdjustmentCritA']} label="Begrunnelse for justering:" />
                        //                         <p>{ntLabels.score}</p>
                        //                         <ScoreUnsure appState={appState}
                        //                                 critScores={koder.scoresA}
                        //                                 firstValue={"scoreA"}
                        //                                 secondValue={"unsureA"}/>
                        //                     </div> : 
                        //                     <div>
                        //                         <p>{ntLabels.scoreSummary}</p>
                        //                         <ScoreUnsure appState={appState}
                        //                                 critScores={koder.scoresA}                                                        
                        //                                 disabled={"false"}
                        //                                 firstValue={"scoreA"}
                        //                                 secondValue={"unsureA"}/>
                        //                     </div> }     
                        //                     <Xcomp.Button primary onClick= {() => {
                        //                         //console.log("Save assessment")
                        //                          appState.saveCurrentAssessment();
                        //                         }}>{labels.AppHeader.assessmentSave}</Xcomp.Button>                      
                        // </div>
                    : riskAssessment.chosenSpreadMedanLifespan == "SpreadRscriptEstimatedSpeciesLongevity" ? 
                <div>
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
                   
                    {/* <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresB}
                                disabled={"false"}
                                firstValue={"scoreB"}
                                secondValue={"unsureB"}/>

                    <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>{labels.AppHeader.assessmentSave}</Xcomp.Button> */}

                </div> : 
                // null }
                   
                // {
                riskAssessment.chosenSpreadMedanLifespan == "ViableAnalysis" ? 
                <div>
                
                    <p>{labels.Acrit.PVAAnalysis}</p>
                    <Xcomp.HtmlString observableValue={[riskAssessment, 'spreadPVAAnalysis']} />

                    
                    
                   {/* <div className="numberFields">
                        
                       <h4>{labels.Acrit.data}</h4>
                        <p>{labels.DistributionHistory.noDocuments}.</p>
                        
                        <p>{labels.General.upload}</p> 
                        
                       <Xcomp.Button primary >{labels.General.chooseFiles}</Xcomp.Button>
                        <span>{labels.General.noFileChosen}</span>
                          <Filliste
                                //baseDirectory={`${appState.vurderingId.split('/').join('_')}/ViableAnalysis`}
                                vurdering ={assessment}
                                 labels={labels.DistributionHistory}
                                 //{...appState.vurdering.Datasett}
                                 />
                    </div>*/}
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
                    
                   {/* <p>{ntLabels.scoreSummary}</p>
                     <ScoreUnsure appState={appState}
                                critScores={koder.scoresB}                                
                                disabled={"false"}
                                firstValue={"scoreB"}
                                secondValue={"unsureB"}/>
                     <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>{labels.AppHeader.assessmentSave}</Xcomp.Button> */}
                </div> : 
                riskAssessment.roAscore2018 != null &&
                <b>Den utgåtte metoden c) Rødlistekriterier var brukt på A-kriteriet for denne arten i 2018. Det resulterte i skår {riskAssessment.roAscore2018} på A-kriteriet.</b> }

                {riskAssessment.chosenSpreadMedanLifespan != "RedListCategoryLevel" && riskAssessment.chosenSpreadMedanLifespan != "" && 
                    <Criterion criterion={critA} 
                    appState={appState}
                    mode="noheading"
                    disabled = {disabled || (riskAssessment.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" && riskAssessment.acceptOrAdjustCritA == "accept")}
                    // commente out to fix isDirty problem. fix in enhanceCriteria necessery
                    // auto = {riskAssessment.chosenSpreadMedanLifespan == "ViableAnalysis" ||
                    //          riskAssessment.chosenSpreadMedanLifespan == "SpreadRscriptEstimatedSpeciesLongevity" ||
                    //          (riskAssessment.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" && riskAssessment.acceptOrAdjustCritA != "adjust") 
                            
                    //         }
                    />}
                </fieldset>
                <br/>
                <fieldset className="well">
                    <h4>{critB.heading}</h4>
                    <p>{critB.info}</p>

                    <SelectableRadio
                                label={labels.BcritSelect.a}
                                value={"a"}
                                disabled={disabled}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                     
                    <SelectableRadio
                                label={labels.BcritSelect.b}
                                value={"b"}
                                disabled={disabled}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>

                {riskAssessment.chosenSpreadYearlyIncrease == "a" ? 
                        <div> 
                            <p> {labels.BcritText.enterParameters}<i>{labels.BcritText.standartSettings}</i></p>

                            <div className="statusField"> 
                            <div className="labels">
                                    <p>{labels.Bcrit.mCount}</p>
                                    <p>{labels.Bcrit.model}</p>
                                    <p>{labels.Bcrit.occurrencesListed}</p>
                                    {/*<p>{labels.Bcrit.exact}</p>
                                    <p>{labels.Bcrit.p}</p>
                                    <p>{labels.Bcrit.newObs}</p>*/}
                                                            
                            </div>
                            <div className="numberFields">
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
                              {/*<Xcomp.StringEnum                            
                                            observableValue={[riskAssessment, "bCritExact"]}
                                            //placeholder={"false"}
                                            codes={koder.TrueOrFalse}
                                        />  
                                <Xcomp.StringEnum                            
                                            observableValue={[riskAssessment, "bCritP"]}
                                            codes={koder.BCritP}
                                        />  

                                <Xcomp.String                            
                                            observableValue={[riskAssessment, "bCritNewObs"]}
                                            placeholder={"True"}
                                            disabled={disabled}
                              />   */}                   
                                        
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
                                   {/* <h4>{labels.Bcrit.data}</h4>
                                    <div className="BCritFiles">
                                        <div className="filenames">
                                            <p><b>{labels.DistributionHistory.filename}</b></p>                                            
                                            
                                        </div>
                                        <div className="fileDescriptions">
                                            <p><b>{labels.DistributionHistory.fileDescription}</b></p>
                                            <Xcomp.String observableValue={[riskAssessment, 'fileDescription']} placeholder={"Dette er beskrivelsen"}/>
                                        </div>
                                    </div> */}
                                   
                                </div>
                            </div>
                            <hr></hr>                    
                                    <div>
                                        <Documents/>
                                    </div>

                            <br></br>

                              {/*   <p>{ntLabels.scoreSummary}</p>
                               <ScoreUnsure appState={appState}
                                            critScores={koder.scoresB}
                                            disabled={"false"}
                                            firstValue={"scoreB"}
                                            secondValue={"unsureB"}/>
                                            
                                            <Xcomp.Button primary onClick= {() => {
                                    console.log("Save assessment")
                                    appState.saveCurrentAssessment();
                                }}>{labels.AppHeader.assessmentSave}</Xcomp.Button>*/}
                                
                        </div> : 
                        riskAssessment.chosenSpreadYearlyIncrease == "b" && assessment.alienSpeciesCategory == "DoorKnocker" ?
                            <div>
                            <p>{textDKB}</p>
                            <p dangerouslySetInnerHTML={{ __html: labels.BcritText.DoorKnocker}}></p>
                                              {/*  <p>{ntLabels.scoreSummary}</p>
                                                <ScoreUnsure appState={appState}
                                                            critScores={koder.scoresB}
                                                            disabled={"false"}
                                                            firstValue={"scoreB"}
                                                            secondValue={"unsureB"}/>
                                                            
                                                            <Xcomp.Button primary onClick= {() => {
                                                   // console.log("Save assessment")
                                                    appState.saveCurrentAssessment();
                                                }}>{labels.AppHeader.assessmentSave}</Xcomp.Button>*/}
                                                
                            </div> : 
                        riskAssessment.chosenSpreadYearlyIncrease == "b" ?
                            <div>
                                <hr />
                                <p>Er artens første forekomst i norsk natur fra år 2012 eller senere?</p>
                                <Xcomp.StringEnum 
                                    mode="radio"
                                    observableValue={[riskAssessment, "AOOfirstOccurenceLessThan10Years"]} 
                                    // style={{marginLeft: "35px"}}
                                    codes={koder.yesNo}
                                />                  
                                {riskAssessment.AOOfirstOccurenceLessThan10Years === "no" ?
                                    <>
                                        <p> Hvis tidsserien tillater det anbefales det at ekspansjonshastigheten estimeres ut fra kjent forekomstareal ved to ulike år, hvor perioden fra år 1 t.o.m. år 2 er på minimum 10 år. Er dette mulig?</p>
                                        <Xcomp.StringEnum 
                                            mode="radio"
                                            observableValue={[riskAssessment, "AOOestimationPeriod10yrPossible"]} 
                                            // style={{marginLeft: "45px"}}
                                            codes={koder.yesNo}
                                        />                  
                                    </> : 
                                    null
                                }

                                <p style={{marginTop: "10px", marginBottom: "20px", paddingTop: "20px"}} dangerouslySetInnerHTML={{__html: labels.BcritText.SelfProducing}}></p>


                                        <table className="table BCritTable">
                                            <thead>
                                                <tr>     
                                                <th></th>                                           
                                                <th dangerouslySetInnerHTML={{
                                                     __html: labels.Bcrit.fromYear }}></th>
                                                <th dangerouslySetInnerHTML={{
                                                     __html: labels.Bcrit.toYear}}></th>
                                                <th dangerouslySetInnerHTML={{
                                                     __html: labels.Bcrit.km2}}></th> 
                                                <th dangerouslySetInnerHTML={{
                                                     __html: labels.Bcrit.km2withoutConsideration}}></th>                                                  
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {(AOO1error || AOO1warn)
                                            ? <tr><td colspan="5">{AOO1error ? <b style={{ color: "red" }}>{AOO1error}</b> : <b style={{ color: "orange" }}> {AOO1warn}</b>}</td></tr>
                                            : null
                                            }
                                            <tr>
                                                <td>
                                                    {/* <Xcomp.Button primary>{labels.DistributionHistory.speciesMap}</Xcomp.Button> */}
                                                    <div style={{marginBottom: 10}}>
                                                        <ModalArtskart
                                                            taxonId={assessment.taxonId}
                                                            scientificNameId={assessment.evaluatedScientificNameId}
                                                            evaluationContext={assessment.evaluationContext}
                                                            showWaterAreas={this.GetIsRegionalAssessment(assessment)}
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
                                                <td> <Xcomp.Number       
                                                        disabled 
                                                        className={"BcritYear"}                    
                                                        observableValue={[riskAssessment, "AOOendyear1"]} 
                                                        integer 
                                                    /> 
                                                </td>
                                                <td style={{display: 'flex'}}><Xcomp.Number                            
                                                        // observableValue={[riskAssessment, "AOOendyear1"]}
                                                        observableValue={[riskAssessment, "AOOyear1"]}
                                                        integer
                                                        className={"BcritYear"}
                                                        yearRange={true}
                                                    /> <span style={{margin: '10px 10px 0'}}>(t<sub>1</sub>)</span>
                                                    </td>
                                                <td><Xcomp.Number                            
                                                        observableValue={[riskAssessment, "AOOknown1"]}
                                                        integer
                                                        disabled={!riskAssessment.notUseSpeciesMap}
                                                    />
                                                </td>
                                                <td><Xcomp.Number                            
                                                        observableValue={[riskAssessment, "AOO1"]}
                                                        observableErrors={[errorhandler, "(a)err7"]}
                                                        integer
                                                    />
                                                </td>
                                               
                                            </tr>
                                            {AOO2error || AOO2warn 
                                            ? <tr><td colspan="5">{AOO2error ? <b style={{ color: "red" }}>{AOO2error}</b> : <b style={{ color: "orange" }}> {AOO2warn}</b>}</td></tr>
                                            : null
                                            }
                                            <tr>
                                                <td>
                                                    {/* <Xcomp.Button primary>{labels.DistributionHistory.speciesMap}</Xcomp.Button> */}
                                                    <div style={{marginBottom: 10}}>
                                                        <ModalArtskart
                                                            taxonId={assessment.taxonId}
                                                            scientificNameId={assessment.evaluatedScientificNameId}
                                                            evaluationContext={assessment.evaluationContext}
                                                            showWaterAreas={this.GetIsRegionalAssessment(assessment)}
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
                                                <td> <Xcomp.Number   
                                                        disabled                         
                                                        observableValue={[riskAssessment, "AOOendyear1"]}
                                                        // observableValue={[riskAssessment, "AOOyear1"]}
                                                        className={"BcritYear"}
                                                        integer
                                                        yearRange={true}/> 
                                                </td>
                                                <td style={{display: 'flex'}}><Xcomp.Number            
                                                        //disabled = {!riskAssessment.notUse2021AsEndYear}                
                                                        // observableValue={[riskAssessment, "AOOendyear2"]} 
                                                        className={"BcritYear"}
                                                        observableValue={[riskAssessment, "AOOyear2"]} 
                                                        yearRange={true}/> <span style={{margin: '10px 10px 0'}}>(t<sub>2</sub>)</span>
                                                </td>
                                                <td>
                                                <Xcomp.Number observableValue={[riskAssessment, "AOOknown2"]} integer disabled={!riskAssessment.notUseSpeciesMap} /> 
                                                </td> 
                                                <td><Xcomp.Number                            
                                                        observableValue={[riskAssessment, "AOO2"]}
                                                        observableErrors={[errorhandler, "(a)err8"]}
                                                        integer
                                                    />
                                                </td>                                               
                                            </tr>
                                            </tbody>                            
                                        </table>
                                        <Xcomp.Bool observableValue={[riskAssessment, "notUseSpeciesMap"]} label={"Ønsker ikke å bruke Artskart for å beregne forekomstareal"} />
                                        {/*<table className="table BCritTable">
                                            <thead>    
                                                <tr>                          
                                                <th>{labels.Bcrit.fromYear}</th>
                                                <th>{labels.Bcrit.toYear}</th>
                                                <th></th>
                                                <th>{labels.Bcrit.knownExpansion}</th>
                                                <th></th>
                                                </tr>  
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td>t1</td>
                                                <td></td>
                                                <td dangerouslySetInnerHTML={{
                                                     __html: labels.Bcrit.km2 }}></td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td>t2</td>
                                                <td></td>
                                                <td dangerouslySetInnerHTML={{
                                                     __html: labels.Bcrit.km2 }}></td>
                                            </tr>
                                            </tbody>                            
                                                </table>*/}
                                                
                                    <p>{labels.Bcrit.commentOrDescription}</p>
                                    <Xcomp.HtmlString                            
                                                observableValue={[riskAssessment, "commentOrDescription"]}                                                
                                            />                      
                                    
                                    <p>{textASB} </p>
                                   {/* <p>{ntLabels.scoreSummary}</p>
                                    <ScoreUnsure appState={appState}
                                                critScores={koder.scoresB}
                                                disabled={"false"}
                                                firstValue={"scoreB"}
                                            secondValue={"unsureB"}/>
                                            
                                            <Xcomp.Button primary onClick= {() => {
                                        console.log("Save assessment")
                                        appState.saveCurrentAssessment();
                                    }}>{labels.AppHeader.assessmentSave}</Xcomp.Button>
*/}
                                    
                            </div> : null
                }
                  {/*  
                    <SelectableRadio
                                label={labels.BcritSelect.c}
                                value={"spreadYearlyLiteratureData"}
                           observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/> 
                  <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadYearlyIncreaseObservations"]}
                        label={labels.BcritSelect.a}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadYearlyLiteratureData"]}
                        label={labels.BcritSelect.c}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadYearlyIncreaseCalculatedExpansionSpeed"]}
                  label={labels.BcritSelect.d}/> */}



                    {/* {riskAssessment.activeSpreadYearlyIncreaseObservations
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">
                                                {labels.BcritSelect.a}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">
                                                <br/>
                                                <a href="https://view.nina.no/expansion/" target="_blank">{labels.Bcrit.rScriptExpansion}</a>
                                                <br/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservations">{labels.Bcrit.expansion}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    disabled={disabled}
                                                    //observableValue={[riskAssessment, 'spreadYearlyIncreaseObservations']}/>
                                                    observableValue={[riskAssessment, 'occurrences1Best']}
                                                    integer/>
                                                    
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsLowerQuartile">{labels.Bcrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    disabled={disabled}
                                                    //observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsLowerQuartile']}/>
                                                    observableValue={[riskAssessment, 'occurrences1Low']}
                                                    integer/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsUpperQuartile">{labels.Bcrit.higher}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    disabled={disabled}
                                                    //observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsUpperQuartile']}/>
                                                    observableValue={[riskAssessment, 'occurrences1High']}
                                                    integer/>

                                            </td>
                                        </tr>
                                       
                                        {appState.fileUploadEnabled
                                        ? <tr>
                                            <td>
                                                {nbsp}
                                            </td>
                                            <td>
                                                <h4>{labels.Bcrit.data}</h4>
                                                <Filliste
                                                    baseDirectory={`${appState
                                                    .vurderingId
                                                    .split('/').join('_')}/SpreadYearlyIncrease`}
                                                    labels={labels.DistributionHistory}
                                                    //{...appState.vurdering.Datasett}
                                                    />
                                                    
                                            </td>
                                        </tr>
                                        : null }
                                    </tbody>
                                </table>
                                
                                <hr/>
                            </div>
                        : null} */}



                        
                       
                            {riskAssessment.chosenSpreadYearlyIncrease != "SpreadYearlyLiteratureData" && riskAssessment.chosenSpreadYearlyIncrease != "SpreadYearlyIncreaseCalculatedExpansionSpeed" && riskAssessment.chosenSpreadYearlyIncrease != "SpreadYearlyIncreaseObservations" && riskAssessment.chosenSpreadYearlyIncrease != "" && 
                                <div
                                    style={{
                                    display: "inline-block"
                                    }}>
                                <Criterion criterion={critB} appState={appState} 
                                            //disabled={disabled} 
                                            // according to issues #318 and #319
                                            // disabled={disabled || riskAssessment.chosenSpreadYearlyIncrease == "a" || (riskAssessment.chosenSpreadYearlyIncrease == "b" && assessment.alienSpeciesCategory == "DoorKnocker")}
                                            // auto={riskAssessment.chosenSpreadYearlyIncrease == "a" || assessment.alienSpeciesCategory == "DoorKnocker"} 
                                            mode="noheading"/>
                                <hr></hr>
                            
                            </div>
                            }
                           
                       
                    {riskAssessment.activeSpreadYearlyLiteratureData
                        ? <div className="previousAssessment">
                                <table className="formtable Bcrit">
                                <p>{labels.BcritText.transferredFrom2018}</p>
                                    <tbody>
                                        <tr>
                                            <th colSpan="4">
                                                {labels.BcritText.transferredFromB}
                                            </th>
                                        </tr>
                                       {/* <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataExpansionSpeed">{labels.Bcrit.literatureDataExpansionSpeed}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataExpansionSpeed']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataUncertainty">{labels.Bcrit.uncertainty}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataUncertainty']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataNumberOfIntroductionSources">{labels.Bcrit.introductionSources}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataNumberOfIntroductionSources']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>{labels.Bcrit.expansionSpeed}</label>
                                            </td>
                                            <td>
                                                <b>{presentValue(riskAssessment.spreadYearlyLiteratureData)}</b>
                                            </td>
                                       </tr>*/}
                                        <tr>
                                            
                                                <label htmlFor="spreadYearlyLiteratureDataAssumptions">{labels.Bcrit.literatureDataAssumptions}</label>
                                           
                                                <Xcomp.HtmlString
                                                     disabled={true}
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataSource']}/>
                                            
                                        </tr>
                                    </tbody>
                                </table>
                                
                            </div>

                        : null}
                    {riskAssessment.activeSpreadYearlyIncreaseCalculatedExpansionSpeed
                        ? <div className="previousAssessment">
                                <table className="formtable">
                                {!riskAssessment.activeSpreadYearlyLiteratureData && 
                                    <p>{labels.BcritText.transferredFrom2018}</p>
                                }
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">
                                                {labels.BcritText.transferredFromC}
                                            </th>
                                        </tr>
                                        {/*<tr>
                                            <td>
                                                <label>{labels.Bcrit.existenceArea}</label>
                                            </td>
                                            <td>
                                                {existenceArea35 || existenceArea35 === 0
                                                    ? <b>{existenceArea35}</b>
                                                    : <b
                                                        style={{
                                                        color: "red"
                                                    }}>{labels.Bcrit.existenceAreaRef35}</b>
                                                }
                                            </td>
                                            </tr>*/}
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
                     <hr/>
                </fieldset>
                <fieldset className="well">
                    {/* {/*<h4>{critC.heading} &nbsp;{labels.Ccrit.transferedFrom4}</h4>
                    
                     <ScoreUnsure appState={appState}
                                critScores={koder.scoresC}
                                firstValue={"scoreC"}
                                secondValue={"unsureC"}/>
                    */}
                    <h4>{critC.heading}</h4>
                    <p>{critC.info}</p>
                    <Criterion criterion={critC} mode="noheading" disabled={true} appState={appState}/>
                    </fieldset>
                </div>
                }
                
            </div>
        );
    }
}
// Vurdering51Invasjonspotensiale.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     riskAssessment: PropTypes.object.isRequired
// }

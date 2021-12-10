import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {action, runInAction} from 'mobx'

import * as Xcomp from './observableComponents';
import Tabs from '../tabs'
import Criterion from './criterion'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
//import ScoreUnsure from './51Naturtyper/scoreUnsure';
import config from '../../config'
import {codes2labels, getCriterion} from '../../utils'
import Filliste from './35Utbredelseshistorikk/Filliste'
import FileUpload from '../FileUpload'
import Documents from '../documents'
import { KeyboardHideSharp } from '@material-ui/icons'
import {stringFormat} from "../../utils"

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
    // getCriterion(riskAssessment, akse, letter) {     const result =
    // riskAssessment.criteria.filter(c => c.akse === akse && c.criteriaLetter ===
    // letter)[0];     return result; }
    render() {
        const {appState:{assessment, assessment:{riskAssessment}}, appState:{riskAssessmentTabs}, appState, } = this.props;

        // const labels = appState.kodeLabels
        const labels = appState.codeLabels
        const koder = appState.koder
        const disabled = appState.userContext.readonly
        const ntLabels = labels.NatureTypes

        const existenceArea35 = assessment.CurrentExistenceAreaCalculated

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
        const crit51A = getCriterion(riskAssessment, 0, "A")
        // console.log(crit51A)
        const crit51B = getCriterion(riskAssessment, 0, "B")
        const critC = getCriterion(riskAssessment, 0, "C")
        runInAction(() => {
            // crit51A.auto = false
            crit51B.auto = false
            critC.auto = false
        })
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
                    <h4>{crit51A.heading}</h4>
                    <p>{crit51A.info}</p>
                    
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
                                         
                                            
                        <div>
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
                   <Xcomp.Number observableValue={[riskAssessment, "populationSize"]} integer />  
                   <Xcomp.Number observableValue={[riskAssessment, "growthRate"]} />  
                   <Xcomp.Number observableValue={[riskAssessment, "envVariance"]} />  
                   <Xcomp.Number observableValue={[riskAssessment, "demVariance"]} />  
                   <Xcomp.Number observableValue={[riskAssessment, "carryingCapacity"]} integer />  
                   <Xcomp.Number observableValue={[riskAssessment, "extinctionThreshold"]} integer />  
                    
                            
                   </div>
                   </div>
                   <a href="http://www.evol.no/hanno/11/levetid.htm" target="_blank">{labels.Acrit.rScriptLongevity}</a>
                   <div className="statusField">
                       <div className="labels">
                        
                        <p>{labels.Acrit.median}</p> 
                       </div>
                       <div className="numberFields">
                       <Xcomp.Number observableValue={[riskAssessment, "medianLifetimeInput"]} integer />  
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

                   <Xcomp.Number observableValue={[riskAssessment, "medianLifetimeInput"]} integer />  {/* ACritMedianLifespan */}
                   <Xcomp.Number observableValue={[riskAssessment, "lifetimeLowerQInput"]} integer />  
                   <Xcomp.Number observableValue={[riskAssessment, "lifetimeUpperQInput"]} integer />                     
                            
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
                <b>Unknown value for chosenSpreadMedanLifespan!: {riskAssessment.chosenSpreadMedanLifespan}</b> }

                {riskAssessment.chosenSpreadMedanLifespan != "RedListCategoryLevel" && riskAssessment.chosenSpreadMedanLifespan != "" && 
                    <Criterion criterion={crit51A} 
                    appState={appState}
                    mode="noheading"
                    auto = {riskAssessment.chosenSpreadMedanLifespan == "ViableAnalysis" ||
                             riskAssessment.chosenSpreadMedanLifespan == "SpreadRscriptEstimatedSpeciesLongevity" ||
                             (riskAssessment.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" && riskAssessment.acceptOrAdjustCritA != "adjust") 
                            
                            }
                    />}
                </fieldset>
                <br/>
                <fieldset className="well">
                    <h4>{crit51B.heading}</h4>
                    <p>{crit51B.info}</p>

                    <SelectableRadio
                                label={labels.BcritSelect.a}
                                value={"a"}
                                disabled={disabled}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                     
                    <SelectableRadio
                                label={labels.BcritSelect.d}
                                value={"b"}
                                disabled={disabled}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>

                {riskAssessment.chosenSpreadYearlyIncrease == "a" ? 
                        <div> 
                            <p> {labels.BcritText.enterParameters}<i>{labels.BcritText.standartSettings}</i></p>

                            <div className="statusField"> 
                            <div className="labels">
                                    <p>{labels.Bcrit.mCount}</p>
                                    <p>{labels.Bcrit.exact}</p>
                                    <p>{labels.Bcrit.p}</p>
                                    <p>{labels.Bcrit.newObs}</p>
                                                            
                            </div>
                            <div className="numberFields">
                            <Xcomp.String                            
                                            observableValue={[riskAssessment, "bCritMCount"]}
                                            placeholder={""}
                                            disabled={disabled}
                                        />  
                              <Xcomp.StringEnum                            
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
                                            integer
                                        />  
                                    <Xcomp.Number                            
                                            observableValue={[riskAssessment, "expansionLowerQInput"]}
                                            integer
                                        />  
                                    <Xcomp.Number                            
                                            observableValue={[riskAssessment, "expansionUpperQInput"]}
                                            integer
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
                                
                                <p style={{marginTop: "20px", marginBottom: "20px", paddingTop: "20px", borderTop:'1px solid gray'}} dangerouslySetInnerHTML={{__html: labels.BcritText.SelfProducing}}></p>
                               {/*   <Xcomp.Radio value={'true'} observableValue={[assessment.riskAssessment, "manuallyAddArea"]} label={labels.Bcrit.useMap} />                    
                                        { assessment.riskAssessment.manuallyAddArea == 'true' ? <Xcomp.Bool observableValue={[assessment.riskAssessment, "notUse2021AsEndYear"]} label={labels.Bcrit.notUse2021} /> : null } 
                                     <Xcomp.Radio value={'false'} observableValue={[assessment.riskAssessment, "manuallyAddArea"]} label={labels.Bcrit.addManually} />                    
                                        { assessment.riskAssessment.manuallyAddArea == 'false' ? <Xcomp.Bool observableValue={[assessment.riskAssessment, "notUse2021AsEndYear"]} label={labels.Bcrit.notUse2021} /> : null }

                                      <span style={{paddingLeft: '40px'}}>{labels.Bcrit.choose}</span> <Xcomp.Button primary >{labels.Bcrit.getFromMap}</Xcomp.Button>
                                            <span>{labels.Bcrit.addManually}</span>

                                            <Xcomp.Bool observableValue={[riskAssessment, "notUseExpansionInNorway"]} label={labels.BcritText.chooseNotToUseKnownArea} /> */}

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
                                                </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>
                                                    <Xcomp.Button primary>{labels.DistributionHistory.speciesMap}</Xcomp.Button>
                                                </td>
                                                <td> <Xcomp.Number       
                                                        disabled                     
                                                        observableValue={[riskAssessment, "AOOyear1"]} 
                                                        integer 
                                                    /> 
                                                </td>
                                                <td style={{display: 'flex'}}><Xcomp.Number                            
                                                        observableValue={[riskAssessment, "AOOendyear1"]}
                                                        integer
                                                        yearRange={true}
                                                    /> <span style={{margin: '10px 10px 0'}}>(t<sub>1</sub>)</span>
                                                    </td>
                                                <td><Xcomp.Number                            
                                                        observableValue={[riskAssessment, "AOO1"]}
                                                        integer
                                                    />
                                                </td>
                                               
                                            </tr>
                                            <tr>
                                                <td>
                                                    <Xcomp.Button primary>{labels.DistributionHistory.speciesMap}</Xcomp.Button>
                                                </td>
                                                <td> <Xcomp.Number   
                                                        disabled                         
                                                        //observableValue={[riskAssessment, "AOOyear2"]}
                                                        observableValue={[riskAssessment, "AOOyear1"]}
                                                        integer
                                                        yearRange={true}/> 
                                                </td>
                                                <td style={{display: 'flex'}}><Xcomp.Number            
                                                        //disabled = {!riskAssessment.notUse2021AsEndYear}                
                                                        observableValue={[riskAssessment, "AOOendyear2"]} 
                                                        yearRange={true}/> <span style={{margin: '10px 10px 0'}}>(t<sub>2</sub>)</span>
                                                </td>
                                                <td><Xcomp.Number observableValue={[riskAssessment, "AOO2"]} integer /> 
                                                </td>                                                
                                            </tr>
                                            </tbody>                            
                                        </table>

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
                    {riskAssessment.activeSpreadYearlyIncreaseObservations
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
                                                <Xcomp.String
                                                    //observableValue={[riskAssessment, 'spreadYearlyIncreaseObservations']}/>
                                                    observableValue={[riskAssessment, 'occurrences1Best']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsLowerQuartile">{labels.Bcrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    //observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsLowerQuartile']}/>
                                                    observableValue={[riskAssessment, 'occurrences1Low']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsUpperQuartile">{labels.Bcrit.higher}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    //observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsUpperQuartile']}/>
                                                    observableValue={[riskAssessment, 'occurrences1High']}/>
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
                        : null}

                        <div>
                       
                            {riskAssessment.chosenSpreadYearlyIncrease != "SpreadYearlyIncreaseCalculatedExpansionSpeed" && riskAssessment.chosenSpreadYearlyIncrease != "" && 
                                <div
                                    style={{
                                    display: "inline-block"
                                    }}>
                                <Criterion criterion={crit51B} appState={appState} auto={riskAssessment.chosenSpreadYearlyIncrease == "a" || assessment.alienSpeciesCategory == "DoorKnocker"} mode="noheading"/>
                            </div>
                            }
                           
                       </div>
                       <hr></hr>
                    {riskAssessment.activeSpreadYearlyLiteratureData
                        ? <div>
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
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.activeSpreadYearlyIncreaseCalculatedExpansionSpeed
                        ? <div>
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
                                <hr/>
                            </div>
                        : null}
                    
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

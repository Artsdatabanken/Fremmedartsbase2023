import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import * as Xcomp from './observableComponents';
import Tabs from '../tabs'
import Criterion from './criterion'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
import ScoreUnsure from './51Naturtyper/scoreUnsure';
import config from '../../config'
import {codes2labels, getCriterion} from '../../utils'
import Filliste from './35Utbredelseshistorikk/Filliste'
import { KeyboardHideSharp } from '@material-ui/icons';

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
        const disabled = false
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
                onChange={(e) => obj[prop] = e.currentTarget.value}/>{label}</label>
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
    // riskAssessment.criteria.filter(c => c.Akse === akse && c.CriteriaLetter ===
    // letter)[0];     return result; }
    render() {
        const {appState:{assessment, assessment:{riskAssessment}}, appState:{riskAssessmentTabs}, appState, } = this.props;

        // const labels = appState.kodeLabels
        const labels = appState.codeLabels
        const koder = appState.koder

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
        const crit51B = getCriterion(riskAssessment, 0, "B")
        const critC = getCriterion(riskAssessment, 0, "C")

        const nbsp = "\u00a0"

        const presentValue = (f) => f === "" ? <span>᠆᠆᠆᠆᠆</span> : f

        // &#11834;
        // <h5>** Invasjonspotensiale nivå: {appState.invasjonspotensialeLevel.level + 1}
        // **</h5> <h5>** Utslagsgivende kriterier:
        // {appState.invasjonspotensialeLevel.decisiveCriteria.map(crit =>
        // crit.CriteriaLetter).sort().join()} **</h5> <h5>** usikkerhet:
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
                    <h4>{crit51A.heading}</h4>
                    <p>{crit51A.info}</p>
                    
                    <SelectableRadio
                            label={labels.AcritSelect.a}
                            value={"spreadPVAAnalysisEstimatedSpeciesLongevity"}
                            observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                    <SelectableRadio
                            label={labels.AcritSelect.b}
                            value={"spreadRscriptEstimatedSpeciesLongevity"}
                            observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                    <SelectableRadio
                            label={labels.AcritSelect.c}
                            value={"redListCategoryLevel"}
                            observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                    {riskAssessment.chosenSpreadMedanLifespan == "spreadPVAAnalysisEstimatedSpeciesLongevity" ? 
                        assessment.alienSpeciesCategory == "DoorKnocker" ? 
                        <fieldset className="well">

                        <p>Basert på det beste anslaget på [X1] forekomster i løpet av 10 år og [X2] introduksjoner i samme tidsperiode er A-kriteriet forhåndsskåret som [X3] (med usikkerhet: [X4-X5]). 
                                                Dette innebærer at artens mediane levetid ligger [mellom X6 år og X7 år], eller at sannsynligheten for utdøing innen 50 år er på [mellom X8 % og X9 %].</p>
                                           
                            <Xcomp.StringEnum observableValue={[riskAssessment, "acceptOrAdjustCritA"]} mode="radio" codes={koder.AcceptOrAdjust}/>   
                                         
                                            {riskAssessment.acceptOrAdjustCritA == "b" ? 
                                            <div>
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'reasonForAdjustmentCritA']} label="Begrunnelse for justering:" />
                                                <p>{ntLabels.score}</p>
                                                <ScoreUnsure appState={appState}
                                                        critScores={koder.scoresA}
                                                        firstValue={"scoreA"}
                                                        secondValue={"unsureA"}/>
                                            </div> : 
                                            <div>
                                                <p>{ntLabels.scoreSummary}</p>
                                                <ScoreUnsure appState={appState}
                                                        critScores={koder.scoresA}                                                        
                                                        disabled={"false"}
                                                        firstValue={"scoreA"}
                                                        secondValue={"unsureA"}/>
                                            </div> }
                                            <Xcomp.Button primary onClick= {() => {
                                                //console.log("Save assessment")
                                                 appState.saveCurrentAssessment();
                                                }}>Lagre</Xcomp.Button>   
                                            
                        </fieldset> : 
                        <fieldset className="well">
                            <p>Basert på de beste anslagene på forekomstareal i dag ([X1] km2) og om 50 år ([X2] km2) er A-kriteriet forhåndsskåret som [X3] (med usikkerhet: [X4-X5]). 
                                Dette innebærer at artens mediane levetid ligger [mellom X6 år og X7 år], eller at sannsynligheten for utdøing innen 50 år er på [mellom X8 % og X9 %].</p>
                            <Xcomp.StringEnum observableValue={[riskAssessment, "acceptOrAdjustCritA"]} mode="radio" codes={koder.AcceptOrAdjust}/>   

                            {riskAssessment.acceptOrAdjustCritA == "b" ? 
                                            <div>
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'reasonForAdjustmentCritA']} label="Begrunnelse for justering:" />
                                                <p>{ntLabels.score}</p>
                                                <ScoreUnsure appState={appState}
                                                        critScores={koder.scoresA}
                                                        firstValue={"scoreA"}
                                                        secondValue={"unsureA"}/>
                                            </div> : 
                                            <div>
                                                <p>{ntLabels.scoreSummary}</p>
                                                <ScoreUnsure appState={appState}
                                                        critScores={koder.scoresA}                                                        
                                                        disabled={"false"}
                                                        firstValue={"scoreA"}
                                                        secondValue={"unsureA"}/>
                                            </div> }     
                                            <Xcomp.Button primary onClick= {() => {
                                                //console.log("Save assessment")
                                                 appState.saveCurrentAssessment();
                                                }}>Lagre</Xcomp.Button>                      
                        </fieldset>
                        : null

                }
                    

                  {/*  <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>Lagre</Xcomp.Button> */}

            {riskAssessment.chosenSpreadMedanLifespan == "spreadRscriptEstimatedSpeciesLongevity" ? 
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
                   <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritSpeciesCount"]}
                                integer
                            />  
                    <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritPopGrowth"]}
                                double
                            />  

                    <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritEnvirVariance"]}
                                integer
                            />  

                    <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritDemoVariance"]}
                                integer
                            />  
                    <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritSustainability"]}
                                integer
                            />  
                            
                   <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritExtThreshold"]}
                                integer
                            />  
                    
                            
                   </div>
                   </div>
                   <a href="#">{labels.Acrit.rScriptLongevity}</a>
                   <div className="statusField">
                       <div className="labels">
                        
                        <p>{labels.Acrit.median}</p> 
                       </div>
                       <div className="numberFields">
                       <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritMedian"]}
                                integer
                            />  
                       </div>
                   </div>
                   
                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresB}
                                disabled={"false"}
                                firstValue={"scoreB"}
                                secondValue={"unsureB"}/>

                    <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>Lagre</Xcomp.Button>

                </div> : null }
                   
                {riskAssessment.chosenSpreadMedanLifespan == "redListCategoryLevel" ? 
                <div>
                    <div className="statusField"> 
                   <div className="labels">
                        <p>{labels.Acrit.PVAAnalysis}</p>

                    </div>
                    <div className="numberFields">
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'PVAAnalysis']} />
                        <h4>{labels.Acrit.data}</h4>
                        <p>{labels.DistributionHistory.noDocuments}.</p>
                        <span>Last opp:</span> <Xcomp.Button primary >Velg filer</Xcomp.Button>
                        <span>Ingen fil valgt</span>
                    </div>
                    </div>
                    <div className="statusField">
                        <div className="labels">
                        <p>{labels.Acrit.median}</p>
                        <p>{labels.Acrit.lower}</p>
                        <p>{labels.Acrit.upper}</p>
                        
                   </div>
                   <div className="numberFields">                  

                    <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritMedianLifespan"]}
                                integer
                            />  
                    <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritLower"]}
                                integer
                            />  
                            
                   <Xcomp.Number                            
                                observableValue={[riskAssessment, "ACritUpper"]}
                                integer
                            />                     
                            
                   </div>
                   </div>
                    
                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresB}                                
                                disabled={"false"}
                                firstValue={"scoreB"}
                                secondValue={"unsureB"}/>
                     <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>Lagre</Xcomp.Button>
                </div> : null }
                
                   {/* {riskAssessment.activeSpreadPVAAnalysisEstimatedSpeciesLongevity
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">{labels.AcritSelect.a}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadPVAAnalysis">{labels.Acrit.PVAAnalysis}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'spreadPVAAnalysis']}/>
                                            </td>
                                        </tr>
                                        {appState.fileUploadEnabled
                                        ? <tr>
                                            <td>
                                                {nbsp}
                                            </td>
                                            <td>
                                                <h4>{labels.Acrit.data}</h4>
                                                <Filliste
                                                    baseDirectory={`${appState
                                                    .vurderingId
                                                    .split('/').join('_')}/SpreadPVAAnalysis`}
                                                    labels={labels.DistributionHistory}
                                                    {...appState.vurdering.Datasett}/>
                                            </td>
                                        </tr>
                                        : null}
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadPVAAnalysisEstimatedSpeciesLongevity">{labels.Acrit.median}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadPVAAnalysisEstimatedSpeciesLongevity']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile">{labels.Acrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'spreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile">{labels.Acrit.upper}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'spreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile']}/>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveSpreadRscriptEstimatedSpeciesLongevity
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">{labels.AcritSelect.b}</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptSpeciesCount">{labels.Acrit.speciesCount}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'spreadRscriptSpeciesCount']}
                                                    integer
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptPopulationGrowth">{labels.Acrit.populationGrowth}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptPopulationGrowth']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptEnvironmantVariance">{labels.Acrit.environmantVariance}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptEnvironmantVariance']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptDemographicVariance">{labels.Acrit.demographicVariance}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptDemographicVariance']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptSustainabilityK">{labels.Acrit.sustainability}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptSustainabilityK']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptQuasiExtinctionThreshold">{labels.Acrit.extinctionThreshold}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptQuasiExtinctionThreshold']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">
                                                <br/>
                                                <br/>
                                                <a href="http://www.evol.no/hanno/11/levetid.htm" target="_blank">{labels.Acrit.rScriptLongevity}</a>
                                                <br/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <br/>
                                                <label htmlFor="spreadRscriptEstimatedSpeciesLongevity">{labels.Acrit.median}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptEstimatedSpeciesLongevity']}/>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveRedListCategoryLevel
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">{labels.AcritSelect.c}</th>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">
                                                <br/>
                                                <span>{labels.Acrit.overview} &nbsp;
                                                    <a href="http://data.artsdatabanken.no/Files/12371" target="_blank">{labels.Acrit.overviewHere}</a>
                                                </span>
                                                <br/>
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="redListDataDescription">{labels.Acrit.dataDescription}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'redListDataDescription']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="redListUsedCriteria">{labels.Acrit.redlistCrit}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String observableValue={[riskAssessment, 'redListUsedCriteria']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="redListCategory">{labels.Acrit.redlistCategory}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String observableValue={[riskAssessment, 'redListCategory']}/>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                    : null} */}
                    <div>
                        <div
                            style={{
                            marginRight: "90px",
                            display: "inline-block"
                        }}>
                            
                        </div>
                        <div
                            style={{
                            display: "inline-block"
                        }}>
                            <Criterion criterion={crit51A} mode="noheading"/>
                        </div>
                    </div>

                </fieldset>
                <br/>
                <fieldset className="well">
                    <h4>{crit51B.heading}</h4>
                    <p>{crit51B.info}</p>

                    <SelectableRadio
                                label={labels.BcritSelect.a}
                                value={"a"}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                     
                    <SelectableRadio
                                label={labels.BcritSelect.d}
                                value={"b"}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                                
                <p>Angi verdi på parametere <i>(standardinnstilling er forhåndsfylt)</i></p>

                <div className="statusField"> 
                   <div className="labels">
                        <p>{labels.Bcrit.mCount}</p>
                        <p>{labels.Bcrit.exact}</p>
                        <p>{labels.Bcrit.p}</p>
                        <p>{labels.Bcrit.newObs}</p>
                                                
                   </div>
                   <div className="numberFields">
                   <Xcomp.String                            
                                observableValue={[riskAssessment, "BCritMCount"]}
                                placeholder={""}
                            />  
                    <Xcomp.String                            
                                observableValue={[riskAssessment, "BCritExact"]}
                                placeholder={"false"}
                            />  

                    <Xcomp.String                            
                                observableValue={[riskAssessment, "BCritP"]}
                                placeholder={"1"}
                            />  

                    <Xcomp.String                            
                                observableValue={[riskAssessment, "BCritNewObs"]}
                                placeholder={"true"}
                            />                      
                            
                   </div>
                   </div>

                   <a href="#">{labels.Bcrit.rScriptExpansion}</a>
                   <div className="statusField">
                       <div className="labelsB">
                        
                        <p>{labels.Bcrit.expansion}</p> 
                        <p>{labels.Bcrit.lower}</p> 
                        <p>{labels.Bcrit.higher}</p> 
                       </div>
                       <div className="numberFieldsB">
                       <Xcomp.Number                            
                                observableValue={[riskAssessment, "BCritExpansion"]}
                                double
                            />  
                        <Xcomp.Number                            
                                observableValue={[riskAssessment, "BCritLower"]}
                                double
                            />  
                        <Xcomp.Number                            
                                observableValue={[riskAssessment, "BCritHigher"]}
                                double
                            />  
                        <h4>{labels.Bcrit.data}</h4>
                        <div className="BCritFiles">
                            <div className="filenames">
                                <p><b>{labels.DistributionHistory.filename}</b></p>

                                
                                
                            </div>
                            <div className="fileDescriptions">
                                <p><b>{labels.DistributionHistory.fileDescription}</b></p>
                                <Xcomp.HtmlString observableValue={[riskAssessment, 'fileDescription']} />
                            </div>
                        </div> 
                            <p>Last opp:</p> <Xcomp.Button primary >Velg filer</Xcomp.Button>
                            <span>Ingen fil valgt</span>
                       </div>
                   </div>


                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresB}
                                firstValue={"scoreB"}
                                secondValue={"unsureB"}/>
                     <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>Lagre</Xcomp.Button>

                    <p> Økningen i forekomstareal beregnes ut fra kjent forekomstareal ved to ulike år; år t1 og år t2 hvor t1 er mindre enn t2. 
                        Forekomstarealet per år t1 (eller t2) regnes ut fra alle inkluderte forekomster fra og med et valgt startår (t0) til og med år t1 (eller t2). 
                        Startåret t0 er felles for t1 og t2. For t2 er i år satt som standardinnstilling og kjent forekomstareal i dag, tilhørende t0 og t2 er overført direkte fra 
                        Utbredelse i Norge. Valgt periode (antall år mellom t1 og t2) skal ikke overstige 20 år og skal representere den perioden økningen er størst 
                        (anbefaler å bruke minimum 10 år hvis tidsserien tillater det).   </p>

                        <span>{labels.Bcrit.choose}</span> <Xcomp.Button primary >{labels.Bcrit.getFromMap}</Xcomp.Button>
                            <span>{labels.Bcrit.addManually}</span>

                        <Xcomp.Bool observableValue={[riskAssessment, "notUseExpansionInNorway"]} label={"jeg ønsker ikke å bruke kjent forekomstareal i dag (ved år t2) fra Utbredelse i Norge"} />

                        <table className="table BCritTable">
                            <thead>
                                <tr>
                                <th><i>{labels.Bcrit.i}</i></th>
                                <th>{labels.Bcrit.fromYear}</th>
                                <th>{labels.Bcrit.toYear}</th>
                                <th>{labels.Bcrit.knownExpansion}</th>
                                <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>[overført fra utbr. fanen]</td>
                                <td></td>
                                <td></td>
                                <td>{labels.Bcrit.km2}</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>[overført fra utbr. fanen]</td>
                                <td>[overført fra utbr. fanen]</td>
                                <td>[overført fra utbr. fanen]</td>
                                <td>{labels.Bcrit.km2}</td>
                            </tr>
                            </tbody>                            
                        </table>

                        <table className="table BCritTable">
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
                                <td>{labels.Bcrit.km2}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td></td>
                                <td>t2</td>
                                <td></td>
                                <td>{labels.Bcrit.km2}</td>
                            </tr>
                            </tbody>                            
                        </table>

                    <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "commentOrDescription"]}
                                label={labels.Bcrit.commentOrDescription}
                            />                      
                    <p>
                    Ekspansjonshastigheten er beregnet til [tallverdi] m/år basert på anslått økning i forekomstareal i perioden fra [t1] til [t2].
                    </p>

                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresB}
                                firstValue={"scoreB"}
                                secondValue={"unsureB"}/>
                     <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>Lagre</Xcomp.Button>

                    <p>Basert på det beste anslaget på [X1] forekomster i løpet av 10 år og [X2] introduksjoner i samme tidsperiode er B-kriteriet skåra som [X3] (med usikkerhet: [X4-X5]). 
                        Dette innebærer at artens ekspansjonshastighet ligger mellom [X6 m/år og X7 m/år]. </p>
                      <p>  Dersom denne verdien framstår som urealistisk, bør antatt forekomstareal om 50 år (se Utbredelse i Norge) vurderes justert.
                    </p>
                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresB}
                                firstValue={"scoreB"}
                                secondValue={"unsureB"}/>
                     <Xcomp.Button primary onClick= {() => {
                         console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>Lagre</Xcomp.Button>
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
                                                <a href="http://www.evol.no/hanno/16/ekspan.htm" target="_blank">{labels.Bcrit.rScriptExpansion}</a>
                                                <br/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservations">{labels.Bcrit.expansion}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseObservations']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsLowerQuartile">{labels.Bcrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsLowerQuartile']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsUpperQuartile">{labels.Bcrit.higher}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsUpperQuartile']}/>
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
                                                    {...appState.vurdering.Datasett}/>
                                            </td>
                                        </tr>
                                        : null }
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveSpreadYearlyLiteratureData
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">
                                                {labels.BcritSelect.c}
                                            </th>
                                        </tr>
                                        <tr>
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
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataAssumptions">{labels.Bcrit.literatureDataAssumptions}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataSource']}/>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveSpreadYearlyIncreaseCalculatedExpansionSpeed
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">
                                                {labels.BcritSelect.d}
                                            </th>
                                        </tr>
                                        <tr>
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
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseEstimate">{labels.Bcrit.yearlyIncrease}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseEstimate']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseEstimateDescription">{labels.Bcrit.estimateDescription}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString
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
                    <div>
                        <div
                            style={{
                            marginRight: "90px",
                            display: "inline-block"
                        }}>
                            
                        </div>
                        <div
                            style={{
                            display: "inline-block"
                        }}>
                            <Criterion criterion={crit51B} mode="noheading"/>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="well">
                    {/* {/*<h4>{critC.heading} &nbsp;{labels.Ccrit.transferedFrom4}</h4> */}
                    <h4>{critC.heading}</h4>
                    <p>{critC.info}</p>
                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresC}
                                firstValue={"scoreC"}
                                secondValue={"unsureC"}/>
                    <Criterion criterion={critC} mode="noheading"/>
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

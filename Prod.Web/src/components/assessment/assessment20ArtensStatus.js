import React from 'react';
import {observer, inject} from 'mobx-react';
// import PropTypes from 'prop-types';
import config from '../../config';
// import RadioGroup from './radioGroup'
import * as Xcomp from './observableComponents';
// import DomesticObservedAndEstablished from './20ArtensStatus/DomesticObservedAndEstablished';

import {action, autorun, extendObservable, observable, toJS} from "mobx"

// import createTaxonSearch from '../createTaxonSearch'

const SkalVurderesLabel = ({skalVurderes}) => (skalVurderes
    ? <label>
            Arten skal risikovurderes videre</label>
: <label className="important-info">Arter som faller innenfor denne gruppen skal ikke risikovurderes videre</label>)

const nbsp = "\u00a0"

@inject("appState")
@observer
export default class Assessment20ArtensStatus extends React.Component {
//@observer
    constructor(props) {
        super(props)
   }
   

checkStatus = (production) => {
    // finds all the objects with id's that should be hidden 
    if ( production != true ) {
        
        return "B2"
    }   
    else {
         return ""
    }
 }

 

    render() {
        const {appState:{assessment}, appState, newTaxon} = this.props;
       // const vurdering = assessment
        const labels = appState.codeLabels 
        // console.log("labels" + JSON.stringify(labels.FirstObservation))
        
        const codes = appState.koder
        const standardPeriods = [
            nbsp,
            "-1800",
            "1800-1849",
            "1850-1899",
            "1900-1949",
            "1950-1959",
            "1960-1969",
            "1970-1979",
            "1980-1989",
            "1990-1999",
            "2000-2009",
            "2010-",
            labels.FirstObservation.dontknow
        ];
        
        return (
            <div>
                {config.showPageHeaders
                    ? <h3>{labels.critDocumentation.status}</h3>
                    : <br/>}            
                <fieldset className="well">
                    <h2>{labels.SpeciesStatus.statusHeading}</h2>
                    <p>{labels.SpeciesStatus.isAlienSpecies} </p>
                    <p>{labels.SpeciesStatus.unsureIfAlien} </p>
                    <Xcomp.Radio value={'true'} observableValue={[assessment, "isAlienSpeciesString"]} defaultChecked={assessment.alienSpeciesCategory == "RegionallyAlien"} label={labels.General.yes} />                    
                    { assessment.isAlienSpecies && assessment.alienSpeciesCategory != "DoorKnocker" ? 
                            <Xcomp.Bool className={"regionallyAlien"} observableValue={[assessment, "isRegionallyAlien"]} checked={assessment.alienSpeciesCategory == "RegionallyAlien"} label={labels.SpeciesStatus.regionallyAlien} /> : null }
                    <Xcomp.Radio value={'false'} observableValue={[assessment, "isAlienSpeciesString"]} label={labels.General.no} />
                    <p>{labels.SpeciesStatus.unsureAlienDescription}</p>
                    {assessment.notApplicableCategory == "notAlienSpecie" ?
                    // transfer "notApplicableDescription" from FAB3                    
                    
                    <Xcomp.HtmlString observableValue={[assessment, 'assesmentNotApplicableDescription']}/> :
                    <Xcomp.HtmlString observableValue={[assessment, 'isAlien']}/>
                }
                    
                    { assessment.isAlienSpecies ?
                    <div>   
                        <p>{labels.SpeciesStatus.higherOrLowerLevel} </p> 
                        <Xcomp.StringEnum mode="radiohorizontal" observableValue={[assessment, "higherOrLowerLevelString"]} 
                                style={{marginTop: "20px"}}
                                codes={codes.yesNo}
                                />     

                        {!assessment.higherOrLowerLevel &&
                        <>
                            <p>{labels.SpeciesStatus.connectedToAnotherTaxon} </p> 
                        <Xcomp.StringEnum mode="radiohorizontal" observableValue={[assessment, "connectedToAnotherString"]} 
                                style={{marginTop: "20px"}}
                                codes={codes.yesNo}
                                />
                        
                        {assessment.connectedToAnother || assessment.connectedToAnother ?
                        <div className={"connectedTaxons"}>
                            {assessment.connectedTaxon && assessment.connectedTaxon.taxonId != "" ? 
                            <div 
                                    className="speciesNewItem"
                                    onClick={action(() => {
                                        assessment.connectedTaxon.taxonId = "";
                                        assessment.connectedTaxon.taxonRank = "";
                                        assessment.connectedTaxon.scientificName = "";
                                        assessment.connectedTaxon.scientificNameId = "";
                                        assessment.connectedTaxon.scientificNameAuthor = "";
                                        assessment.connectedTaxon.vernacularName = "";
                                        assessment.connectedTaxon.redListCategory = "";
                                        assessment.connectedTaxon.taxonSearchResult.replace([]); 
                                        assessment.connectedTaxon.taxonSearchString = "";                                        
                                        }) 
                                        
                                    }
                                >
                                    <div className={"rlCategory " + assessment.connectedTaxon.redListCategory}>{ assessment.connectedTaxon.redListCategory}</div>
                                    <div className="vernacularName">{assessment.connectedTaxon.vernacularName}</div>
                                    <div className="scientificName">{assessment.connectedTaxon.scientificName}</div>
                                    <div className="author">{"(" + assessment.connectedTaxon.scientificNameAuthor + ")"}</div>
                                </div> :
                            <div style={{position: 'relative'}}> <p style={{marginLeft: '30px', marginBottom: '10px'}}>{labels.SpeciesStatus.enterTaxonName}</p>
                                {newTaxon.scientificName.length > 0 ?
                                <div 
                                    className="speciesNewItem"
                                    onClick={action(() => {
                                       newTaxon.taxonId = "";
                                        newTaxon.taxonRank = "";
                                        newTaxon.scientificName = "";
                                        newTaxon.scientificNameId = "";
                                        newTaxon.scientificNameAuthor = "";
                                        newTaxon.vernacularName = "";
                                        newTaxon.redListCategory = "";
                                        newTaxon.taxonSearchResult.replace([]); 
                                        newTaxon.taxonSearchString = "";                                        
                                        }) 
                                        
                                    }
                                >
                                    <div className={"rlCategory " + newTaxon.redListCategory}>{newTaxon.RedListCategory}</div>
                                    <div className="vernacularName">{newTaxon.vernacularName}</div>
                                    <div className="scientificName">{newTaxon.scientificName}</div>
                                    <div className="author">{"(" + newTaxon.scientificNameAuthor + ")"}</div>
                                </div> :
                                <Xcomp.String observableValue={[newTaxon, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />}
                                {newTaxon.taxonSearchResult.length > 0 ?
                                <div className="speciesSearchList" style={{position: 'absolute', top: "36px", left:"15px"}}>
                                    <ul className="panel list-unstyled">
                                    {newTaxon.taxonSearchResult.map(item =>
                                        <li onClick={action(e => {
                                            newTaxon.taxonId = item.taxonId;
                                            newTaxon.taxonRank = item.taxonRank;
                                            newTaxon.scientificName = item.scientificName;
                                            newTaxon.scientificNameId = item.scientificNameId;
                                            newTaxon.scientificNameAuthor = item.author;
                                            newTaxon.vernacularName = item.popularName;

                                            newTaxon.redListCategory = item.rlCategory;
                                            newTaxon.taxonSearchResult.replace([]); 
                                            newTaxon.taxonSearchString = "";                                            
                                            assessment.connectedTaxon = item
                                         })} 
                                            key={item.scientificName}
                                        >
                                            <div className="speciesSearchItem">
                                                <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                                <span className="vernacularName">{item.popularName}</span>
                                                <div className="scientificName">{item.scientificName}</div>
                                                <div className="author">{"(" + item.author + ")"}</div>
                                            </div>
                                        </li>
                                    )}
                                    </ul>
                                </div> :
                                null}
                                {newTaxon.taxonSearchWaitingForResult ?
                                <div  style={{zIndex: 10000, position: 'absolute', top: "40px", left:"35px"}}>
                                    <div  className={"three-bounce"}>
                                        <div className="bounce1" />
                                        <div className="bounce2" />
                                        <div className="bounce3" />
                                    </div>
                                </div> :
                                null}
                            </div> }             

                            <p>Nærmere begrunnelse</p>
                            <Xcomp.HtmlString observableValue={[assessment, 'assesmentNotApplicableDescription']}/>                
                            </div> : null }
                        </>
                        }           
                    </div> : null} 

                    { (assessment.isAlienSpecies && !assessment.higherOrLowerLevel)
                    ? 
                     <div>
                     <div>
                     

                         <p>{labels.SpeciesStatus.isProductionSpecies}</p>                          
                         <Xcomp.StringEnum observableValue={[assessment, "productionSpeciesString"]} mode="radio" codes={codes.yesNo}/> 
                         {(assessment.productionSpecies == true && assessment.notApplicableCategory == "traditionalProductionSpecie") && 
                            // transfer "notApplicableDescription" from FAB3
                            <Xcomp.HtmlString observableValue={[assessment, 'assesmentNotApplicableDescription']}/>                            
                        }
                    </div>
                         <p> { assessment.isRegionallyAlien ? labels.SpeciesStatus.statusInNorwayRegionallyAlien : labels.SpeciesStatus.statusInNorway }</p>
                         <p>{labels.SpeciesStatus.highestCategoryPerToday}</p>
                         <div style={{display: "flex"}}>
                         <Xcomp.StringEnum className="statusChoice" observableValue={[assessment, "speciesStatus"]} mode="radio" 
                            // checks if the species is a door knocker or not and if it is a production species to determine the available options to choose
                            options={this.checkStatus(assessment.productionSpecies)}
                            codes={codes.EstablishmentCategory}/>        
                            <span className="statusWarning">{appState.statusChange ? assessment.alienSpeciesCategory == "DoorKnocker" ? "Arten har nå endret status fra å være selvstendig reproduserende til å være en dørstokkart. Er dette riktig?" :
                                    "Arten har nå endret status fra å være en dørstokkart til å være selvstendig reproduserende i norsk natur." : null}</span>
                            </div>

                        <p>{labels.SpeciesStatus.codesExplanation}</p>
                        <br></br>
                        {
                        //assessment.horizonDoScanning && 
                        assessment.horizonEstablismentPotential == 1 && (assessment.speciesStatus == "C1" || assessment.speciesStatus == "C0" || assessment.speciesStatus == "B1" || assessment.speciesStatus == "B2") ? 
                        
                        <div>
                            <p>{labels.SpeciesStatus.assumedReproducing50Years}</p>
                            <Xcomp.StringEnum observableValue={[assessment, "assumedReproducing50YearsString"]} mode="radio" codes={codes.yesNo}/>
                        </div>
                        : null} 
                        <br></br>
                        <div>
                            <p>{assessment.isRegionallyAlien ? labels.SpeciesStatus.establishedBefore1800RegionallyAlien : labels.SpeciesStatus.establishedBefore1800} </p>
                            <p>{labels.SpeciesStatus.probabilityUncertainity}</p>
                            <Xcomp.StringEnum observableValue={[assessment, "alienSpecieUncertainIfEstablishedBefore1800String"]} mode="radio" codes={codes.yesNo}/>
                        </div>

                            <p>{labels.SpeciesStatus.uncertainityEstablishmentTimeDescription}</p>
                            
                            <Xcomp.HtmlString observableValue={[assessment, 'assesmentNotApplicableDescription']}/> 
                        
                     </div> : null}
                    
                    { !assessment.isAlienSpecies ?
                    <div>
                        <p>{labels.SpeciesStatus.didSpecies} </p>
                        <Xcomp.StringEnum observableValue={[assessment, "changedFromAlien"]} mode="radio" codes={codes.ChangedFromAlien}/>
                       {/* <Xcomp.Radio kode={"VærtFremmed"} observableValue={[assessment, "changedFromAlien"]} label={labels.SpeciesStatus.wasAlienButEstablishedNow} />
                        <Xcomp.Radio kode={"VærtAntattFremmed"} observableValue={[assessment, "changedFromAlien"]} label={labels.SpeciesStatus.wasThoughtToBeAlien} /> */}
                        <p>{labels.SpeciesStatus.reasonForChangingOfStatusDescription}</p>
                        <Xcomp.HtmlString observableValue={[assessment, 'changedAssessment']}/>
                    </div> : null }
                    </fieldset>

                    <fieldset 
                            className={assessment.assessmentConclusion == "" || assessment.assessmentConclusion == "NotDecided" ? "invisible well" : "well"}
                            >
                        <h3>{labels.SpeciesStatus.conclusion} </h3>
                        <p>
                            {assessment.assessmentConclusion == "" || assessment.assessmentConclusion == "NotDecided" ? "" : assessment.assessmentConclusion == "WillNotBeRiskAssessed" ? labels.SpeciesStatus.willNotBeRiskAssessed : labels.SpeciesStatus.willBeRiskAssessed}
                            <b> {assessment.assessmentConclusion == "" || assessment.assessmentConclusion == "WillNotBeRiskAssessed" || assessment.assessmentConclusion == "NotDecided" ? "" : assessment.assessmentConclusion == "AssessedSelfReproducing" ? labels.SpeciesStatus.assessedSelfReproducing + "." : labels.SpeciesStatus.assessedDoorknocker + "."}</b>
                        </p>
                    </fieldset> 
                    
                    {/*assessment.assessmentConclusion != "" &&
                        <fieldset className="well">
                                { assessment.assessmentConclusion == "AssessedSelfReproducing"
                                    ?  <><h3>{labels.SpeciesStatus.conclusion}</h3>
                                        <p>{labels.SpeciesStatus.willBeRiskAssessed}<b>{labels.SpeciesStatus.assessedSelfReproducing}</b>.</p></>
                                    : assessment.assessmentConclusion == "AssessedDoorknocker"
                                    ? <><h3>{labels.SpeciesStatus.conclusion}</h3>
                                        <p>{labels.SpeciesStatus.willBeRiskAssessed}<b>{labels.SpeciesStatus.assessedDoorknocker}</b>.</p></> 
                                    : assessment.assessmentConclusion == "WillNotBeRiskAssessed"
                                    ?   <>
                                            <h3>{labels.SpeciesStatus.conclusion}</h3>
                                            <p>{labels.SpeciesStatus.willNotBeRiskAssessed}</p> 
                                        </>
                                    : null
                                }

                        </fieldset>
                            */}

                    {assessment.isAlienSpecies && 
                       // (!assessment.connectedToAnother || !assessment.connectedToAnother ) &&
                        (assessment.wrongAssessed == false || assessment.wrongAssessed == null ) && assessment.speciesStatus != null && assessment.wrongAssessed != "yes" ?
                        <fieldset className="well">
                            {assessment.speciesStatus != "A" &&
                               <> <h3>{labels.SpeciesStatus.firstObservationOfSpecies}</h3> 
                               <div className="statusField">                                    
                                    <div className="firstObs">
                                    {assessment.speciesStatus != "A" &&
                                        <p>{labels.SpeciesStatus.enterYearOfTheFirstObservationInNorway}</p>	
                                    }
                                    <ul>
                                         {/*assessment.speciesStatus == "C3" &&*/}
                                         <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.establishmentInNorwegianNature}}></li> 

                                         {/*(assessment.speciesStatus == "C3" || assessment.speciesStatus == "C2") &&*/}
                                         <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.reproductionInNorwegianNature}}></li> 

                                          {/*assessment.speciesStatus.indexOf("C") > -1 &&*/}
                                          <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.speciesInNorwegianNature}}></li> 

                                           {/*(assessment.productionSpecies == true && assessment.speciesStatus == "C3") &&*/}
                                           <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.speciesEstablishmentProductionArea}}></li>

                                            {/*assessment.productionSpecies == true && (assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") &&*/}
                                            <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.speciesReproductionInProductionAreaOutdoors}}></li>
                                         {/* Removed the logic as described in the issue #341 */}
                                        {/*assessment.productionSpecies == true && assessment.speciesStatus != "A" && assessment.speciesStatus != "B1"*/}
                                            {assessment.speciesStatus != "A" 
                                             && assessment.speciesStatus != null &&
                                            <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.speciesInProductionAreaOutdoors}}></li>
                                        }
                                        {assessment.speciesStatus != "A" &&
                                            <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.reproductionOutdoorsIfRelevant}}></li>
                                        }

                                       {assessment.speciesStatus != "A" &&
                                            <li dangerouslySetInnerHTML={{__html: labels.SpeciesStatus.speciesIndoorsIfRelevant}}></li>
                                        }
                                        
                                    </ul>	
                                    </div>
                                    <div className="yearsAndCheckboxes">
                                        <ul className="listOfYears">
                                        { assessment.speciesStatus != "A" &&
                                            <p>{labels.SpeciesStatus.uncertainity}</p>	
                                        }
                                        
                                         {/*assessment.speciesStatus == "C3" && */}
                                         <li>
                                                <Xcomp.Number                            
                                                    observableValue={[assessment.riskAssessment, "yearFirstEstablishedNature"]}
                                                    integer
                                                    yearRange={true}
                                                />    
                                                <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstEstablishedNatureInsecure"]} /> 
                                                </li>
                                           

                                           {/* (assessment.speciesStatus == "C3" || assessment.speciesStatus == "C2") && */}
                                           <li>
                                                <Xcomp.Number                            
                                                    observableValue={[assessment.riskAssessment, "yearFirstReproductionNature"]}
                                                    integer
                                                    yearRange={true}
                                                />    
                                                <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstReproductionNatureInsecure"]} /> 
                                                </li> 

                                             {/*assessment.speciesStatus != null && assessment.speciesStatus.indexOf("C") > -1 && */}
                                             <li>                                    
                                                <Xcomp.Number                            
                                                    observableValue={[assessment.riskAssessment, "yearFirstNature"]}
                                                    integer
                                                    yearRange={true}
                                                />    
                                                <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstNatureInsecure"]} /> 
                                                </li> 
                                            {/*(assessment.productionSpecies == true && assessment.speciesStatus == "C3") &&*/}
                                            <li>
                                                    <Xcomp.Number                            
                                                        observableValue={[assessment.riskAssessment, "yearFirstEstablishmentProductionArea"]}
                                                        integer
                                                        yearRange={true}
                                                    />    
                                                    <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstEstablishmentProductionAreaInsecure"]} /> 
                                                    </li>

                                            {/*assessment.productionSpecies == true && (assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") && */} 
                                            <li>
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstReproductionOutdoors"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstReproductionOutdoorsInsecure"]} /> 
                                            </li> 
                                            
                                        
                                            {/*assessment.productionSpecies == true && assessment.speciesStatus != "A" && assessment.speciesStatus != "B1"*/}
                                        { assessment.speciesStatus != "A" && assessment.speciesStatus != null &&
                                            <li>
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoors"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoorsInsecure"]} /> 
                                            </li>}
                                            
                                            {assessment.speciesStatus != "A" && assessment.speciesStatus != null &&                                   
                                            <li>
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstReproductionIndoors"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstReproductionIndoorsInsecure"]} /> 
                                            </li> }

                                        {assessment.speciesStatus != "A" &&
                                            <li> 
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstIndoors"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstIndoorsInsecure"]} /> 
                                            </li>}

                                            
                                        </ul>
                                    </div>
                                </div>	
                               </>
                            }
                            
                            	

                            {assessment.speciesStatus != "A" && assessment.speciesStatus != null &&                            	
                                <p>{labels.SpeciesStatus.uncertainityMoreThanFiveYears}</p> }

                            {assessment.speciesStatus == "A" && 
                                <p>{labels.SpeciesStatus.foundInNorwayBefore}</p> }
                            {(assessment.speciesStatus == "B1" || assessment.speciesStatus == "B2" ) &&
                                <p className="furtherInfo">{labels.SpeciesStatus.furtherInformationRegardingSpecies}</p>}
                            {(assessment.speciesStatus == "C0" || assessment.speciesStatus == "C1" || assessment.speciesStatus == "C2") &&
                                <p className="furtherInfo">{labels.SpeciesStatus.furtherInformationRegardingReproductionOfSpecies}</p>
                            }
                            {assessment.speciesStatus != "C3" && assessment.speciesStatus != null &&
                                <Xcomp.HtmlString className="furtherInfo" observableValue={[assessment.riskAssessment, 'furtherInfo']}/> }
                            </fieldset> : null }
                

      
            </div>
        );
    }
}

// vurdering31ArtensStatus.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     vurdering: PropTypes.object.isRequired
// }

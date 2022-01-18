import React from 'react';
import {observer, inject} from 'mobx-react';
import PropTypes from 'prop-types';
import config from '../../config';
// import RadioGroup from './radioGroup'
import * as Xcomp from './observableComponents';
import DomesticObservedAndEstablished from './20ArtensStatus/DomesticObservedAndEstablished';

import {action, autorun, extendObservable, observable, toJS} from "mobx"

import createTaxonSearch from '../createTaxonSearch'
//import createTaxonSearch from './createTaxonSearch'

// const labels = config.labels
// const standardPeriods = [
//     nbsp,
//     "-1800",
//     "1800-1849",
//     "1850-1899",
//     "1900-1949",
//     "1950-1959",
//     "1960-1969",
//     "1970-1979",
//     "1980-1989",
//     "1990-1999",
//     "2000-2009",
//     "2010-",
//     "Vet ikke"
// ];

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
                    { assessment.isAlienSpeciesString == 'true' && assessment.alienSpeciesCategory != "DoorKnocker" ? 
                            <Xcomp.Bool className={"regionallyAlien"} observableValue={[assessment, "isRegionallyAlien"]} checked={assessment.alienSpeciesCategory == "RegionallyAlien"} label={labels.SpeciesStatus.regionallyAlien} /> : null }
                    <Xcomp.Radio value={'false'} observableValue={[assessment, "isAlienSpeciesString"]} label={labels.General.no} />
                    <p>{labels.SpeciesStatus.unsureAlienDescription}</p>
                    {assessment.notApplicableCategory == "notAlienSpecie" ?
                    // transfer "notApplicableDescription" from FAB3                    
                    
                    <Xcomp.HtmlString observableValue={[assessment, 'assesmentNotApplicableDescription']}/> :
                    <Xcomp.HtmlString observableValue={[assessment, 'isAlien']}/>
                    
                }
                    
                    { assessment.isAlienSpeciesString == 'true' ?
                    <div>                     
                        <p>{labels.SpeciesStatus.connectedToAnotherTaxon} </p> 
                        <Xcomp.StringEnum mode="radiohorizontal" observableValue={[assessment, "connectedToAnotherString"]} 
                                style={{marginTop: "20px"}}
                                codes={codes.yesNo}
                                />
                        
                        { assessment.connectedToAnotherString == "yes" || assessment.connectedToAnother == true ?
                        <div className={"connectedTaxons"}>
                           {assessment.notApplicableCategory == "taxonIsEvaluatedInHigherRank" && 
                            // transfer "notApplicableDescription" from FAB3
                            <Xcomp.HtmlString observableValue={[assessment, 'assesmentNotApplicableDescription']}/>                             
                           }
                            <Xcomp.Radio value={"Connected"} observableValue={[assessment, "connected"]} label={labels.SpeciesStatus.assessedWithAnotherTaxon}/>
                            {assessment.connected == "Connected" && 

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
                                                <div className="vernacularName">{item.popularName}</div>
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
                               
                                
                            
                            <Xcomp.Radio value={"Shared"} observableValue={[assessment, "connected"]} label={labels.SpeciesStatus.notAssessedButShared} />
                            {assessment.connected == "Shared" && 

                            <div style={{position: 'relative', marginLeft: '20px'}}> <p style={{marginLeft: '30px', marginBottom: '10px'}}>{labels.SpeciesStatus.enterTaxonName}</p>
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
                                        newTaxon.taxonSearchString = "" }) 
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
                                            assessment.connectedTaxon.taxonId = item.taxonId;
                                            assessment.connectedTaxon.taxonRank = item.taxonRank;
                                            assessment.connectedTaxon.scientificName = item.scientificName;
                                            assessment.connectedTaxon.scientificNameId = item.scientificNameId;
                                            assessment.connectedTaxon.scientificNameAuthor = item.author;
                                            assessment.connectedTaxon.vernacularName = item.popularName;

                                            newTaxon.redListCategory = item.rlCategory;
                                            //assessment.connectedTaxon = item
                                        })} 
                                            key={item.scientificName}
                                        >
                                            <div className="speciesSearchItem">
                                                <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                                <div className="vernacularName">{item.popularName}</div>
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
                               
                            </div> : null }
                    </div> : null}

                    { assessment.isAlienSpeciesString == 'true' && (assessment.connectedToAnotherString == "no" || assessment.connectedToAnotherString == "false" ) ? 
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
                            // onChange = {action(_e => {
                            //     if(assessment.speciesStatus != "A" ) { 
                            //         assessment.wrongAssessed = false
                            //         };
                            //         if (assessment.alienSpeciesCategory == "DoorKnocker" && (assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3")) {
                            //             this.statusChange = true
                            //             assessment.alienSpeciesCategory = "AlienSpecie"
                            //             if(assessment.speciesStatus == "C3") {
                            //                 assessment.speciesEstablishmentCategory = "C3"
                            //             }
                            //         }
                            //         else if (assessment.alienSpeciesCategory == "AlienSpecie" && assessment.speciesStatus != "C2" && assessment.speciesStatus != "C3"){
                            //             this.statusChange = true
                            //             assessment.alienSpeciesCategory = "DoorKnocker"
                            //         }
                            //          else {
                            //             this.statusChange = false                                     
                            //         }   
                                                                  
                            //     })}
                            codes={codes.EstablishmentCategory}/>        
                            <span className="statusWarning">{appState.statusChange ? assessment.alienSpeciesCategory == "DoorKnocker" ? "Arten har nå endret status fra å være selvstendig reproduserende til å være en dørstokkart. Er dette riktig?" :
                                    "Arten har nå endret status fra å være en dørstokkart til å være selvstendig reproduserende i norsk natur." : null}</span>
                            </div>

                        <p>{labels.SpeciesStatus.codesExplanation}</p>
                        <br></br>
                        {assessment.horizonDoScanning && assessment.horizonEstablismentPotential == 1 && (assessment.speciesStatus == "C1" || assessment.speciesStatus == "C0" || assessment.speciesStatus == "B1") ? 
                        
                        <div>
                            <p>{labels.SpeciesStatus.assumedReproducing50Years}</p>
                            <Xcomp.StringEnum observableValue={[assessment, "assumedReproducing50YearsString"]} mode="radio" codes={codes.yesNo}/>
                        </div>
                        : null} 
                        <br></br>
                        <div>
                            <p>{assessment.isRegionallyAlien ? labels.SpeciesStatus.establishedBefore1800RegionallyAlien : labels.SpeciesStatus.establishedBefore1800} </p>
                            <Xcomp.StringEnum observableValue={[assessment, "alienSpecieUncertainIfEstablishedBefore1800String"]} mode="radio" codes={codes.yesNo}/>
                        </div>
                        
                        <p>{labels.SpeciesStatus.probabilityUncertainity}</p>

                        {assessment.notApplicableCategory == "establishedBefore1800" &&
                        // transfer "notApplicableDescription" from FAB3
                            <>
                            <p>{labels.SpeciesStatus.uncertainityEstablishmentTimeDescription}</p>
                            
                            <Xcomp.HtmlString observableValue={[assessment, 'assesmentNotApplicableDescription']}/> 
                            </>
                        }
                        
                     </div> : null}

                     {/* assessment.isAlienSpeciesString == 'true'  && 
                       assessment.alienSpeciesCategory != "DoorKnocker" && 
                        assessment.speciesStatus == "A" &&
                        (assessment.connectedToAnotherString == "no" || assessment.connectedToAnotherString == "false") ? 
                        <div className="statusField">
                            <p> {labels.SpeciesStatus.wronglyAssessedBefore} </p>                
                            <Xcomp.Bool observableValue={[assessment, "wrongAssessed"]} />  
                            
                        </div> : null }
                        {(this.statusChange && assessment.alienSpecieUncertainIfEstablishedBefore1800String != "yes") &&
                            <div>
                            <p> {labels.SpeciesStatus.wronglyAssessedBefore} </p>                
                            <Xcomp.StringEnum observableValue={[assessment, "wrongAssessed"]} mode="radio" codes={codes.yesNo}/>  
                            
                        </div>
                    */}

                        
                    
                    { assessment.isAlienSpeciesString == 'false' ?
                    <div>
                        <p>{labels.SpeciesStatus.didSpecies} </p>
                        <Xcomp.StringEnum observableValue={[assessment, "changedFromAlien"]} mode="radio" codes={codes.ChangedFromAlien}/>
                       {/* <Xcomp.Radio kode={"VærtFremmed"} observableValue={[assessment, "changedFromAlien"]} label={labels.SpeciesStatus.wasAlienButEstablishedNow} />
                        <Xcomp.Radio kode={"VærtAntattFremmed"} observableValue={[assessment, "changedFromAlien"]} label={labels.SpeciesStatus.wasThoughtToBeAlien} /> */}
                        <p>{labels.SpeciesStatus.reasonForChangingOfStatusDescription}</p>
                        <Xcomp.HtmlString observableValue={[assessment, 'changedAssessment']}/>
                    </div> : null }
                    </fieldset>
                    
                    {((assessment.isAlienSpeciesString == 'true' || assessment.isAlienSpeciesString == 'false') && assessment.speciesStatus != null) &&
                        <fieldset className="well">
                                        

                               {/* {assessment.isAlienSpeciesString == 'true' && 
                                    (assessment.connectedToAnotherString == "no" || assessment.connectedToAnotherString == "false" ) && 
                                    (assessment.alienSpecieUncertainIfEstablishedBefore1800String == "no" ) &&
                                    //|| assessment.alienSpecieUncertainIfEstablishedBefore1800 == false ) &&
                                    //(assessment.alienSpeciesCategory == "DoorKnocker" || assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") &&
                                    assessment.speciesStatus != null && 
                                    (assessment.connectedToAnotherString == "no" || assessment.connectedToAnotherString == "false") ? 
                                <div>
                                    <h3>{labels.SpeciesStatus.conclusion}</h3>
                                    {(assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") ? 
                                    <p>{labels.SpeciesStatus.willBeRiskAssessed}<b>{labels.SpeciesStatus.assessedSelfReproducing}</b>.</p> :
                                    <p>{labels.SpeciesStatus.willBeRiskAssessed}<b>{labels.SpeciesStatus.assessedDoorknocker}</b>.</p> }
                                </div> :
                                <div>
                                    <h3>{labels.SpeciesStatus.conclusion}</h3>
                                    <p>{labels.SpeciesStatus.willNotBeRiskAssessed}</p> 
                                </div>
                                } */}
                                { assessment.assessmentConclusion == "AssessedSelfReproducing"
                                    ?  <p>{labels.SpeciesStatus.willBeRiskAssessed}<b>{labels.SpeciesStatus.assessedSelfReproducing}</b>.</p>
                                    : assessment.assessmentConclusion == "AssessedDoorknocker"
                                    ? <p>{labels.SpeciesStatus.willBeRiskAssessed}<b>{labels.SpeciesStatus.assessedDoorknocker}</b>.</p> 
                                    : assessment.assessmentConclusion == "WillNotBeRiskAssessed"
                                    ?   <div>
                                            <h3>{labels.SpeciesStatus.conclusion}</h3>
                                            <p>{labels.SpeciesStatus.willNotBeRiskAssessed}</p> 
                                        </div>
                                    : null
                                }

                        </fieldset>
                    }

                    {assessment.isAlienSpeciesString == 'true' && 
                        (assessment.connectedToAnotherString == "no" || assessment.connectedToAnotherString == "false" ) &&
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
                                       {assessment.speciesStatus != "A" &&
                                            <li>{labels.SpeciesStatus.speciesIndoorsIfRelevant}</li>
                                        }
                                        {assessment.speciesStatus != "A" &&
                                            <li> {labels.SpeciesStatus.reproductionOutdoorsIfRelevant}</li>
                                        }
                                        {/* Removed the logic as described in the issue #341 */}
                                        {/*assessment.productionSpecies == true && assessment.speciesStatus != "A" && assessment.speciesStatus != "B1"*/}
                                        {assessment.speciesStatus != "A" 
                                         && assessment.speciesStatus != null &&
                                            <li>{labels.SpeciesStatus.speciesInProductionAreaOutdoors}</li>
                                        }
                                        {/*assessment.productionSpecies == true && (assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") &&*/}
                                            <li>{labels.SpeciesStatus.speciesReproductionInProductionAreaOutdoors}</li>
                                        
                                        {/*(assessment.productionSpecies == true && assessment.speciesStatus == "C3") &&*/}
                                            <li>{labels.SpeciesStatus.speciesEstablishmentProductionArea}</li>
                                        
                                        {/*assessment.speciesStatus.indexOf("C") > -1 &&*/}
                                            <li>{labels.SpeciesStatus.speciesInNorwegianNature}</li> 
    
                                        {/*(assessment.speciesStatus == "C3" || assessment.speciesStatus == "C2") &&*/}
                                            <li>{labels.SpeciesStatus.reproductionInNorwegianNature}</li> 
    
                                        {/*assessment.speciesStatus == "C3" &&*/}
                                            <li> {labels.SpeciesStatus.establishmentInNorwegianNature}</li> 
                                    </ul>	
                                    </div>
                                    <div className="yearsAndCheckboxes">
                                    <ul className="listOfYears">
                                    { assessment.speciesStatus != "A" &&
                                        <p>{labels.SpeciesStatus.uncertainity}</p>	
                                    }
                                    {assessment.speciesStatus != "A" &&
                                        <li> 
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "yearFirstIndoors"]}
                                            integer
                                            yearRange={true}
                                        />    
                                        <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstIndoorsInsecure"]} /> 
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
                                        {/*assessment.productionSpecies == true && (assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") && */} 
                                        <li>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "yearFirstReproductionOutdoors"]}
                                            integer
                                            yearRange={true}
                                        />    
                                        <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstReproductionOutdoorsInsecure"]} /> 
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
                                        
                                        
                                        {/*assessment.speciesStatus != null && assessment.speciesStatus.indexOf("C") > -1 && */}
                                            <li>                                    
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstNature"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstNatureInsecure"]} /> 
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
                                        {/*assessment.speciesStatus == "C3" && */}
                                            <li>
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstEstablishedNature"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstEstablishedNatureInsecure"]} /> 
                                            </li>
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
                
               {/* <Xcomp.Radio
                     kode={koder.AlienSpeciesCategory[0]}
                    //kode={labels.AlienSpeciesCategory[0]}
                    observableValue={[vurdering, "alienSpeciesCategory"]}/>
                    {vurdering.AlienSpeciesCategory === 'AlienSpecie' ?
                    <div className="well">
                        <Xcomp.Bool
                            label={labels.StatusUncertainty.uncertainIfEstablishedBefore1800}
                            observableValue={[vurdering, 'alienSpecieUncertainIfEstablishedBefore1800String']}/>
                        <Xcomp.Bool
                            label={labels.StatusUncertainty.uncertainAntropochor}
                            observableValue={[vurdering, 'alienSpecieUncertainAntropochor']}/> 
                        {vurdering.AlienSpecieUncertainIfEstablishedBefore1800 || vurdering.AlienSpecieUncertainAntropochor
                            ? <Xcomp.HtmlString
                                    observableValue={[vurdering, 'alienSpecieUncertainDescription']}
                                    label={labels.StatusUncertainty.uncertainDescription}/>
                            : null}
                        </div>
                        : null} */}
               {/* <Xcomp.Radio
                    kode={koder.AlienSpeciesCategory[4]}
                    observableValue={[vurdering, "alienSpeciesCategory"]}/>
                <Xcomp.Radio
                    kode={koder.AlienSpeciesCategory[1]}
                    observableValue={[vurdering, "alienSpeciesCategory"]}/> */}
                 {/*    {vurdering.AlienSpeciesCategory === 'DoorKnocker'
                    ? <div className="well">
                            <Xcomp.StringEnum
                                observableValue={[vurdering, 'doorKnockerCategory']}
                                codes={koder.DoorKnocker}
                                mode="radio"
                                forceSync/>
                            <br/> 
                            {appState.skalVurderes
                                ? null
                                : <div>
                                    <Xcomp.HtmlString
                                        observableValue={[vurdering, 'doorKnockerDescription']}
                                        //label="Nærmere begrunnelse"/>
                                        label={labels.StatusUncertainty.furtherSpecification}/>
                                    <br/>
                                </div>}
                        </div>
                    : null} */}
              {/*  {appState.regionalRiskAssessmentEnabled
                ? <div>
                    <Xcomp.Radio
                        kode={koder.AlienSpeciesCategory[2]}
                        observableValue={[vurdering, "alienSpeciesCategory"]}/> 
                        {vurdering.AlienSpeciesCategory === 'RegionallyAlien' 
                        ? <div className="well">
                            <Xcomp.StringEnum
                                observableValue={[vurdering, 'regionallyAlienCategory']}
                                codes={koder.RegionallyAlien}
                                mode="radio"
                                forceSync/>
                        </div> 
                        : null}
                </div>
              : null} */}
              {/*  <Xcomp.Radio
                    kode={koder.AlienSpeciesCategory[3]}
                    observableValue={[vurdering, "alienSpeciesCategory"]}/> 
                    {vurdering.AlienSpeciesCategory === 'NotApplicable'
                    ? <div
                            className="well"
                            style={{
                            backgroundColor: "#FDFCFC",
                            paddingTop: "3px",
                            paddingBottom: "3px",
                            paddingLeft: "15px",
                            paddingRight: "15px",
                            marginTop: "15px"
                        }}>
                            <Xcomp.StringEnum
                                observableValue={[vurdering, 'notApplicableCategory']}
                                codes={koder.NotApplicable}
                                mode="radio"
                                forceSync/> {!appState.skalVurderes
                                ? <div>
                                        <Xcomp.HtmlString
                                            observableValue={[vurdering, 'assesmentNotApplicableDescription']}
                                            //label="Nærmere begrunnelse"/>
                                            label={labels.StatusUncertainty.furtherSpecification}/>
                                        <br/>
                                    </div>
                                : null}
                        </div>
                                : null} */}
              {/*  {!(['AlienSpecie', 'DoorKnocker', 'RegionallyAlien', 'NotApplicable', 'EcoEffectWithoutEstablishment'].includes(vurdering.alienSpeciesCategory))
                    ? <div className="well">Sett artens status før du går videre</div>
                    : null}
                <hr/>
                <br/>
                <div className="well">
                    {vurdering.AlienSpeciesCategory === 'RegionallyAlien'
                        ? <h4>{labels.FirstObservation.firstregionalobservation} {appState.evaluationContext[assessment.EvaluationContext].nameWithPreposition}</h4>
                        : <h4>{labels.FirstObservation.firstobservation} {appState.evaluationContext.nameWithPreposition}</h4>}
                    {/*<div style={{width: "190px"}}><Xcomp.StringCombobox observableValue={[vurdering, 'firstDomesticEstablishmentObserved']} selectableValues={standardPeriods} /></div>*/}
                   {/*} <div style={{
                        width: "190px"
                    }}><Xcomp.StringCombobox
                        observableValue={[vurdering, 'firstDomesticObservation']}
                        selectableValues={standardPeriods}/></div>
                    <DomesticObservedAndEstablished
                        observedAndEstablishedStatusInNorway={vurdering.observedAndEstablishedStatusInCountry}
                        koder={koder}
                        labels={labels.FirstObservation}
                        showIndividualCount={appState.isVKM}/>
                </div>
                <br/> /*}
               {/* <div className="well">
                    <table className="formtable">
                        <thead>
                            <tr>
                                <th colSpan="2">
                                    <h4>{labels.PreviousAssessment.previousassessment} </h4>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    style={{
                                    whiteSpace: "nowrap",
                                    textTransform: "capitalize"
                                }}>{labels.PreviousAssessment.domestic}</td>
                                <td><Xcomp.Bool observableValue={[vurdering, 'domesticRiskEvaluationExists']}/></td>
                            </tr>
                            <tr>
                                <td>{labels.PreviousAssessment.abroad}</td>
                                <td>
                                    <div>
                                        {/* <RadioGroup
                                            name="foreignRiskEvaluationExists"
                                            selectedValue={vurdering.ForeignRiskEvaluationExists}
                                            onChange={e => vurdering.ForeignRiskEvaluationExists = e}>
                                            {Radio => (
                                                <div>
                                                    <Radio value/>{`${nbsp}${labels.General.yes}${nbsp}${nbsp}`}
                                                    <Radio value={false}/>{`${nbsp}${labels.General.no}${nbsp}${nbsp}`}
                                                    <Radio value={null}/>{`${nbsp}${labels.General.unknown}${nbsp}${nbsp}`}
                                                </div>
                                            )}
                                        </RadioGroup> */}
                                    {/*</div>
                                </td>
                            </tr>
                            {vurdering.ForeignRiskEvaluationExists === true
                                ? <tr>
                                        <td/>
                                        <td>
                                            <div>
                                                <span>{"Beskriv:"}</span>
                                                <br/>
                                                <Xcomp.HtmlString
                                                    observableValue={[vurdering, 'foreignRiskEvaluationComment']}/>
                                            </div>
                                        </td>
                                    </tr>
                                : null}
                        </tbody>
                    </table>
                  </div> */}
            </div>
        );
    }
}

// vurdering31ArtensStatus.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     vurdering: PropTypes.object.isRequired
// }

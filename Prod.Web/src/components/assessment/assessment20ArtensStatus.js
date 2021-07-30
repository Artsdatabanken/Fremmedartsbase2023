import React from 'react';
import {observer, inject} from 'mobx-react';
import PropTypes from 'prop-types';
import config from '../../config';
// import RadioGroup from './radioGroup'
import * as Xcomp from './observableComponents';
import DomesticObservedAndEstablished from './20ArtensStatus/DomesticObservedAndEstablished';

import {action, autorun, extendObservable, observable, toJS} from "mobx"
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


const  connectedTaxon1 = observable({
    ScientificName: "",
    ScientificNameId: "",
    ScientificNameAuthor: "",
    VernacularName: "",
    TaxonRank: "",
    TaxonId: "",
    RedListCategory: "", 
    Ekspertgruppe: "",
    taxonSearchString: "",
    taxonSearchResult: []
    // taxonSearchWaitingForResult: false - should not be observable
})

const  connectedTaxon2 = observable({
    ScientificName: "",
    ScientificNameId: "",
    ScientificNameAuthor: "",
    VernacularName: "",
    TaxonRank: "",
    TaxonId: "",
    RedListCategory: "", 
    Ekspertgruppe: "",
    taxonSearchString: "",
    taxonSearchResult: []
    // taxonSearchWaitingForResult: false - should not be observable
})

@inject("appState")
@observer
export default class Assessment20ArtensStatus extends React.Component {
// @observer
//     constructor(props) {
//         super(props)

//     }



    render() {
        const {appState:{assessment}, appState} = this.props;
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
                    <b>{labels.SpeciesStatus.isAlienSpecies} </b>
                    <p>{labels.SpeciesStatus.unsureIfAlien} </p>
                    <Xcomp.Radio value={'true'} observableValue={[assessment.riskAssessment, "isAlienSpecies"]} label={labels.General.yes} />                    
                    { assessment.riskAssessment.isAlienSpecies == 'true' && assessment.alienSpeciesCategory != "DoorKnocker" ? <Xcomp.Bool observableValue={[assessment, "isRegionallyAlien"]} label={labels.SpeciesStatus.regionallyAlien} /> : null }
                    <Xcomp.Radio value={'false'} observableValue={[assessment.riskAssessment, "isAlienSpecies"]} label={labels.General.no} />
                    <p>{labels.SpeciesStatus.unsureAlienDescription}</p>
                    <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'isAlien']}/>

                    { assessment.riskAssessment.isAlienSpecies == 'true' ?
                    <div> 
                        <div className="statusField"><b>{labels.SpeciesStatus.connectedToAnotherTaxon} </b> <Xcomp.Bool observableValue={[assessment.riskAssessment, "connectedToAnother"]} /></div>
                        { assessment.riskAssessment.connectedToAnother == true ?
                            <div>
                            <Xcomp.Radio value={"Connected"} observableValue={[assessment.riskAssessment, "connected"]} label={labels.SpeciesStatus.assessedWithAnotherTaxon}/>
                            {assessment.riskAssessment.connected == "Connected" && 
                               <div style={{marginLeft: '20px'}}> <p>{labels.SpeciesStatus.enterTaxonName}</p>
                                <Xcomp.String observableValue={[assessment, 'connectedTaxon1']} placeholder={labels.General.searchSpecies} /> 
                                
                                {connectedTaxon1.taxonSearchResult.length > 0 ?
                                <div className="speciesSearchList" style={{position: 'absolute', top: "36px", left:"-10px", backgroundColor: "#fcfcfc" }}>
                                    <ul className="panel list-unstyled">
                                    {connectedTaxon1.taxonSearchResult.map(item =>
                                        <li onClick={action(e => {
                                            console.log(JSON.stringify(item))

                                            assessment.connectedTaxon1.TaxonId = item.taxonId;
                                            assessment.connectedTaxon1.TaxonRank = item.taxonRank;
                                            assessment.connectedTaxon1.ScientificName = item.scientificName;
                                            assessment.connectedTaxon1.ScientificNameId = item.scientificNameId;
                                            assessment.connectedTaxon1.ScientificNameAuthor = item.author;
                                            assessment.connectedTaxon1.VernacularName = item.popularName;

                                            assessment.connectedTaxon1.RedListCategory = item.rlCategory;
                                            assessment.connectedTaxon1.taxonSearchResult.replace([]); 
                                            assessment.connectedTaxon1.taxonSearchString = "" })} 
                                            key={item.scientificName}
                                        >
                                            <div className="speciesSearchItem">
                                                <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                                {item.popularName ? <span className="vernacularName">{item.popularName + " "}</span> : null }
                                                <span className="scientificName">{item.scientificName}</span>
                                                <span className="author">{item.author && item.author.startsWith('(') ? item.author : '(' + item.author + ')'}</span>
                                            </div>
                                        </li>
                                    )}
                                    </ul>
                                </div> :
                                null}
                               {/* {newAssessment.taxonSearchWaitingForResult ?
                                <div  style={{zIndex: 10000, position: 'absolute', top: "40px", left:"35px"}}>
                                    <div  className={"three-bounce"}>
                                        <div className="bounce1" />
                                        <div className="bounce2" />
                                        <div className="bounce3" />
                                    </div>
                                </div> :
                               null} */}
                                </div>
                            }
                            
                            <Xcomp.Radio value={"Shared"} observableValue={[assessment.riskAssessment, "connected"]} label={labels.SpeciesStatus.notAssessedButShared} />
                            {assessment.riskAssessment.connected == "Shared" && 
                                <div style={{marginLeft: '20px'}}><p>{labels.SpeciesStatus.enterTaxonName}</p>
                                <Xcomp.String observableValue={[assessment, 'connectedTaxon2']} placeholder={labels.General.searchSpecies} /> 
                                
                                {connectedTaxon2.taxonSearchResult.length > 0 ?
                                <div className="speciesSearchList" style={{position: 'absolute', top: "36px", left:"-10px", backgroundColor: "#fcfcfc" }}>
                                    <ul className="panel list-unstyled">
                                    {connectedTaxon2.taxonSearchResult.map(item =>
                                        <li onClick={action(e => {
                                            console.log(JSON.stringify(item))

                                            assessment.connectedTaxon2.TaxonId = item.taxonId;
                                            assessment.connectedTaxon2.TaxonRank = item.taxonRank;
                                            assessment.connectedTaxon2.ScientificName = item.scientificName;
                                            assessment.connectedTaxon2.ScientificNameId = item.scientificNameId;
                                            assessment.connectedTaxon2.ScientificNameAuthor = item.author;
                                            assessment.connectedTaxon2.VernacularName = item.popularName;

                                            assessment.connectedTaxon2.RedListCategory = item.rlCategory;
                                            assessment.connectedTaxon2.taxonSearchResult.replace([]); 
                                            assessment.connectedTaxon2.taxonSearchString = "" })} 
                                            key={item.scientificName}
                                        >
                                            <div className="speciesSearchItem">
                                                <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                                {item.popularName ? <span className="vernacularName">{item.popularName + " "}</span> : null }
                                                <span className="scientificName">{item.scientificName}</span>
                                                <span className="author">{item.author && item.author.startsWith('(') ? item.author : '(' + item.author + ')'}</span>
                                            </div>
                                        </li>
                                    )}
                                    </ul>
                                </div> :
                                null}
                                
                                
                                </div>
                            }
                            </div> : null }
                    </div> : null}

                    { assessment.riskAssessment.isAlienSpecies == 'true' && (assessment.riskAssessment.connectedToAnother == false || assessment.riskAssessment.connectedToAnother == null ) ? 
                     <div>
                     <div className="statusField">
                         <b>{labels.SpeciesStatus.isProductionSpecies}</b> <Xcomp.Bool observableValue={[assessment, "productionSpecies"]} /> </div>
                         <b> {labels.SpeciesStatus.statusInNorway}</b>
                         <p>{labels.SpeciesStatus.highestCategoryPerToday}</p>

                         {assessment.alienSpeciesCategory == "DoorKnocker" ? assessment.productionSpecies == true ? 
                            <Xcomp.StringEnum observableValue={[assessment, "speciesStatus"]} mode="radio" codes={codes.EstablishmentCategoryDoorKnockerProduction}/>
                            :  <Xcomp.StringEnum observableValue={[assessment, "speciesStatus"]} mode="radio" codes={codes.EstablishmentCategoryDoorKnocker}/>
                            : assessment.productionSpecies == true ?
                            <Xcomp.StringEnum observableValue={[assessment, "speciesStatus"]} mode="radio" codes={codes.EstablishmentCategory}/>
                            : <Xcomp.StringEnum observableValue={[assessment, "speciesStatus"]} mode="radio" codes={codes.EstablishmentCategoryWithoutProduction}/>                             
                        }
                       

                        <p>{labels.SpeciesStatus.codesExplanation}</p>
                        <div className="statusField">
                            <b>{labels.SpeciesStatus.establishedBefore1800} </b>
                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "estBefore1800"]} />
                        </div>
                        
                        <p>{labels.SpeciesStatus.probabilityUncertainity}</p>
                        <p>{labels.SpeciesStatus.uncertainityEstablishmentTimeDescription}</p>
                        <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'establishedBefore1800']}/>
                     </div> : null}

                     { assessment.riskAssessment.isAlienSpecies == 'true'  && assessment.alienSpeciesCategory != "DoorKnocker" && assessment.speciesStatus == "A" &&
                        (assessment.riskAssessment.connectedToAnother == false || assessment.riskAssessment.connectedToAnother == null) ? 
                        <div className="statusField">
                            <b> {labels.SpeciesStatus.wronglyAssessedBefore} </b>                
                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "wrongAssessed"]} />  
                            
                        </div> : null }
                    
                    { assessment.riskAssessment.isAlienSpecies == 'false' ?
                    <div>
                        <b>{labels.SpeciesStatus.didSpecies} </b>
                        <Xcomp.Radio kode={"VærtFremmed"} observableValue={[assessment.riskAssessment, "changedFromAlien"]} label={labels.SpeciesStatus.wasAlienButEstablishedNow} />
                        <Xcomp.Radio kode={"VærtAntattFremmed"} observableValue={[assessment.riskAssessment, "changedFromAlien"]} label={labels.SpeciesStatus.wasThoughtToBeAlien} />
                        <p>{labels.SpeciesStatus.reasonForChangingOfStatusDescription}</p>
                        <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'changedAssessment']}/>
                    </div> : null }
                    
                    
                    {assessment.riskAssessment.isAlienSpecies == null ? null :                    

                    assessment.riskAssessment.isAlienSpecies == 'true' && 
                        (assessment.riskAssessment.connectedToAnother == false || assessment.riskAssessment.connectedToAnother == null ) && 
                        (assessment.riskAssessment.estBefore1800 == false || assessment.riskAssessment.estBefore1800 == null ) &&
                        (assessment.alienSpeciesCategory == "DoorKnocker" || assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") &&
                        assessment.speciesStatus != null && 
                        (assessment.riskAssessment.connectedToAnother == false || assessment.riskAssessment.connectedToAnother == null) ? 
                    <div>
                        <h2>{labels.SpeciesStatus.conclusion}</h2>
                        <p>{labels.SpeciesStatus.willBeRiskAssessed}</p> 
                    </div> :
                     <div>
                     <h2>{labels.SpeciesStatus.conclusion}</h2>
                     <p>{labels.SpeciesStatus.willNotBeRiskAssessed}</p> 
                 </div>
                 }
                 </fieldset>

                    { assessment.riskAssessment.isAlienSpecies == 'true' && 
                        (assessment.riskAssessment.connectedToAnother == false || assessment.riskAssessment.connectedToAnother == null ) &&
                        (assessment.riskAssessment.wrongAssessed == false || assessment.riskAssessment.wrongAssessed == null ) ?
                        <fieldset className="well">
                            {assessment.speciesStatus != null && assessment.speciesStatus != "A" &&
                               <> <h3>{labels.SpeciesStatus.firstObservationOfSpecies}</h3> 
                               <div className="statusField">
                                    
                                    <div className="firstObs">
                                    { assessment.speciesStatus != null && assessment.speciesStatus != "A" &&
                                        <p>{labels.SpeciesStatus.enterYearOfTheFirstObservationInNorway}</p>	
                                    }
                                    <ul>
                                       {assessment.speciesStatus != "A" && assessment.speciesStatus != null &&
                                            <li>{labels.SpeciesStatus.speciesIndoorsIfRelevant}</li>
                                        }
                                        {assessment.speciesStatus != "A" && assessment.speciesStatus != null &&
                                            <li> {labels.SpeciesStatus.reproductionOutdoorsIfRelevant}</li>
                                        }
                                        {assessment.productionSpecies == true && assessment.speciesStatus != "A" && assessment.speciesStatus != "B1"
                                         && assessment.speciesStatus != null &&
                                            <li>{labels.SpeciesStatus.speciesInProductionAreaOutdoors}</li>
                                        }
                                        {assessment.productionSpecies == true && (assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") &&
                                            <li>{labels.SpeciesStatus.speciesReproductionInProductionAreaOutdoors}</li>
                                        }
                                        {assessment.speciesStatus != null && assessment.speciesStatus.indexOf("C") > -1 &&
                                        <li>{labels.SpeciesStatus.speciesInNorwegianNature}</li> }
    
                                        {(assessment.speciesStatus == "C3" || assessment.speciesStatus == "C2") &&
                                            <li>{labels.SpeciesStatus.reproductionInNorwegianNature}</li> }
    
                                        {assessment.speciesStatus == "C3" &&
                                        <li> {labels.SpeciesStatus.establishmentInNorwegianNature}</li> }
                                    </ul>	
                                    </div>
                                    <div className="yearsAndCheckboxes">
                                    <ul className="listOfYears">
                                    { assessment.speciesStatus != null && assessment.speciesStatus != "A" &&
                                        <p>{labels.SpeciesStatus.uncertainity}</p>	
                                    }
                                    {assessment.speciesStatus != "A" && assessment.speciesStatus != null &&
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
    
                                        {assessment.productionSpecies == true && assessment.speciesStatus != "A" && assessment.speciesStatus != "B1"
                                         && assessment.speciesStatus != null &&
                                        <li>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoors"]}
                                            integer
                                            yearRange={true}
                                        />    
                                        <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstProductionOutdoorsInsecure"]} /> 
                                        </li>}
                                        {assessment.productionSpecies == true && (assessment.speciesStatus == "C2" || assessment.speciesStatus == "C3") &&
                                        <li>
                                        <Xcomp.Number                            
                                            observableValue={[assessment.riskAssessment, "yearFirstReproductionOutdoors"]}
                                            integer
                                            yearRange={true}
                                        />    
                                        <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstReproductionOutdoorsInsecure"]} /> 
                                        </li> }
                                        
                                        {assessment.speciesStatus != null && assessment.speciesStatus.indexOf("C") > -1 && 
                                            <li>                                    
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstNature"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstNatureInsecure"]} /> 
                                            </li> }
                                        { (assessment.speciesStatus == "C3" || assessment.speciesStatus == "C2") && 
                                            <li>
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstReproductionNature"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstReproductionNatureInsecure"]} /> 
                                            </li> }
                                        {assessment.speciesStatus == "C3" && 
                                            <li>
                                            <Xcomp.Number                            
                                                observableValue={[assessment.riskAssessment, "yearFirstEstablishedNature"]}
                                                integer
                                                yearRange={true}
                                            />    
                                            <Xcomp.Bool observableValue={[assessment.riskAssessment, "yearFirstEstablishedNature"]} /> 
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
                                <p>{labels.SpeciesStatus.furtherInformationRegardingSpecies}</p>}
                            {(assessment.speciesStatus == "C0" || assessment.speciesStatus == "C1" ) &&
                                <p>{labels.SpeciesStatus.furtherInformationRegardingReproductionOfSpecies}</p>
                            }
                            {assessment.speciesStatus != "C3" && assessment.speciesStatus != "C2" && assessment.speciesStatus != null &&
                                <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'furtherInfo']}/> }
                            </fieldset> : null }
                
               {/* <Xcomp.Radio
                     kode={koder.AlienSpeciesCategory[0]}
                    //kode={labels.AlienSpeciesCategory[0]}
                    observableValue={[vurdering, "alienSpeciesCategory"]}/>
                    {vurdering.AlienSpeciesCategory === 'AlienSpecie' ?
                    <div className="well">
                        <Xcomp.Bool
                            label={labels.StatusUncertainty.uncertainIfEstablishedBefore1800}
                            observableValue={[vurdering, 'alienSpecieUncertainIfEstablishedBefore1800']}/>
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

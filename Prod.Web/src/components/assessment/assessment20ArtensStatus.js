import React from 'react';
import {observer, inject} from 'mobx-react';
import PropTypes from 'prop-types';
import config from '../../config';
// import RadioGroup from './radioGroup'
import * as Xcomp from './observableComponents';
import DomesticObservedAndEstablished from './20ArtensStatus/DomesticObservedAndEstablished';

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
// @observer
//     constructor(props) {
//         super(props)

//     }



    render() {
        const {appState:{assessment}, appState} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels 



        // console.log("labels" + JSON.stringify(labels.FirstObservation))

        const koder = appState.koder
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
                <div className="well">
                    <b>{labels.General.isAlienSpecies} </b>
                    <p>{labels.General.unsureIfAlien} </p>
                    <Xcomp.Radio value={'true'} observableValue={[vurdering.riskAssessment, "isAlienSpecies"]} label={labels.General.yes} />                    
                    { vurdering.riskAssessment.isAlienSpecies == 'true' && vurdering.alienSpeciesCategory != "DoorKnocker" ? <Xcomp.Bool observableValue={[vurdering.riskAssessment, "isRegionallyAlien"]} label={labels.General.regionallyAlien} /> : null }
                    <Xcomp.Radio value={'false'} observableValue={[vurdering.riskAssessment, "isAlienSpecies"]} label={labels.General.no} />
                    <p>{labels.General.unsureAlienDescription}</p>
                    <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'isAlien']}/>

                    { vurdering.riskAssessment.isAlienSpecies == 'true' ?
                    <div style={{marginTop: '10px'}}> 
                        <div className="statusField"><b>{labels.General.connectedToAnotherTaxon} </b> <Xcomp.Bool observableValue={[vurdering.riskAssessment, "connectedToAnother"]} /></div>
                        { vurdering.riskAssessment.connectedToAnother == true ?
                            <div>
                            <Xcomp.Radio value={"Connected"} observableValue={[vurdering.riskAssessment, "connected"]} label={labels.General.assessedWithAnotherTaxon}/>
                            <p>{labels.General.enterTaxonName}</p>
                            <Xcomp.String observableValue={[vurdering.riskAssessment, 'connectedTaxon1']} placeholder={labels.General.searchSpecies} />
                            
                            <Xcomp.Radio value={"Shared"} observableValue={[vurdering.riskAssessment, "connected"]} label={labels.General.notAssessedButShared} />
                            <p>{labels.General.enterTaxonName}</p>
                            <Xcomp.String observableValue={[vurdering.riskAssessment, 'connectedTaxon2']} placeholder={labels.General.searchSpecies} /> 
                            </div> : null }
                    </div> : null}

                    { vurdering.riskAssessment.isAlienSpecies == 'true' && (vurdering.riskAssessment.connectedToAnother == false || vurdering.riskAssessment.connectedToAnother == null ) ? 
                     <div>
                     <div className="statusField">
                         <b>{labels.General.isProductionSpecies}</b> <Xcomp.Bool observableValue={[vurdering.riskAssessment, "bruksart"]} /> </div>
                         <b> {labels.General.statusInNorway}</b>
                         <p>{labels.General.highestCategoryPerToday}</p>
                        
                        <Xcomp.Radio value={"C3–E"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={labels.establishmentCategory.C3} />
                        <Xcomp.Radio value={"C2"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={labels.establishmentCategory.C2} />
                        <Xcomp.Radio value={"C1"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={labels.establishmentCategory.C1} />
                        <Xcomp.Radio value={"C0"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={labels.establishmentCategory.C0} />
                        <Xcomp.Radio value={"B2"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={labels.establishmentCategory.B2} />
                        <Xcomp.Radio value={"B1"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={labels.establishmentCategory.B1} />
                        <Xcomp.Radio value={"A"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={labels.establishmentCategory.A} />
                            

                        <p>{labels.General.codesExplanation}</p>
                        <div className="statusField">
                            <b>{labels.General.establishedBefore1800} </b>
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "estBefore1800"]} />
                        </div>
                        
                        <p>{labels.General.probabilityUncertainity}</p>
                        <p>{labels.General.uncertainityEstablishmentTimeDescription}</p>
                        <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'establishedBefore1800']}/>
                     </div> : null}

                     { vurdering.riskAssessment.isAlienSpecies == 'true'  && vurdering.alienSpeciesCategory != "DoorKnocker" && vurdering.riskAssessment.speciesStatus == "A" &&
                        (vurdering.riskAssessment.connectedToAnother == false || vurdering.riskAssessment.connectedToAnother == null) ? 
                        <div className="statusField">
                            <b> {labels.General.wronglyAssessedBefore} </b>                
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "wrongAssessed"]} />  
                            
                        </div> : null }
                    
                    { vurdering.riskAssessment.isAlienSpecies == 'false' ?
                    <div>
                        <b>{labels.General.didSpecies} </b>
                        <Xcomp.Radio kode={"VærtFremmed"} observableValue={[vurdering.riskAssessment, "changedFromAlien"]} label={labels.General.wasAlienButEstablishedNow} />
                        <Xcomp.Radio kode={"VærtAntattFremmed"} observableValue={[vurdering.riskAssessment, "changedFromAlien"]} label={labels.General.wasThoughtToBeAlien} />
                        <p>{labels.General.reasonForChangingOfStatusDescription}</p>
                        <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'changedAssessment']}/>
                    </div> : null }

                    <br/>
                    
                    {vurdering.riskAssessment.isAlienSpecies == null ? null : 
                    
                    vurdering.riskAssessment.isAlienSpecies == 'true' && 
                        (vurdering.riskAssessment.connectedToAnother == false || vurdering.riskAssessment.connectedToAnother == null ) && 
                        (vurdering.riskAssessment.estBefore1800 == false || vurdering.riskAssessment.estBefore1800 == null ) &&
                        (vurdering.alienSpeciesCategory == "DoorKnocker" || vurdering.riskAssessment.speciesStatus == "C2" || vurdering.riskAssessment.speciesStatus == "C3–E") &&
                        vurdering.riskAssessment.speciesStatus != null && 
                        (vurdering.riskAssessment.connectedToAnother == false || vurdering.riskAssessment.connectedToAnother == null) ? 
                    <div>
                        <h2>{labels.General.conclusion}</h2>
                        <p>{labels.General.willBeRiskAssessed}</p> 
                    </div> :
                     <div>
                     <h2>{labels.General.conclusion}</h2>
                     <p>{labels.General.willNotBeRiskAssessed}</p> 
                 </div>}

                    <br/>

                    { vurdering.riskAssessment.isAlienSpecies == 'true' && 
                        (vurdering.riskAssessment.connectedToAnother == false || vurdering.riskAssessment.connectedToAnother == null ) &&
                        (vurdering.riskAssessment.wrongAssessed == false || vurdering.riskAssessment.wrongAssessed == null ) ?
                        <div>
                            {vurdering.riskAssessment.speciesStatus != null && vurdering.riskAssessment.speciesStatus != "A" &&
                                <h3>{labels.General.firstObservationOfSpecies}</h3>
                            }
                            
                            <div className="statusField">
                                    
                                <div className="firstObs">
                                { vurdering.riskAssessment.speciesStatus != null && vurdering.riskAssessment.speciesStatus != "A" &&
                                    <p>{labels.General.enterYearOfTheFirstObservationInNorway}</p>	
                                }
                                <ul>
                                   {vurdering.riskAssessment.speciesStatus != "A" && vurdering.riskAssessment.speciesStatus != null &&
                                        <li>{labels.General.speciesIndoorsIfRelevant}</li>
                                    }
                                    {vurdering.riskAssessment.speciesStatus != "A" && vurdering.riskAssessment.speciesStatus != null &&
                                        <li> {labels.General.reproductionOutdoorsIfRelevant}</li>
                                    }
                                    {vurdering.riskAssessment.bruksart == true && vurdering.riskAssessment.speciesStatus != "A" && vurdering.riskAssessment.speciesStatus != "B1"
                                     && vurdering.riskAssessment.speciesStatus != null &&
                                        <li>{labels.General.speciesInProductionAreaOutdoors}</li>
                                    }
                                    {vurdering.riskAssessment.bruksart == true && (vurdering.riskAssessment.speciesStatus == "C2" || vurdering.riskAssessment.speciesStatus == "C3–E") &&
                                        <li>{labels.General.speciesReproductionInProductionAreaOutdoors}</li>
                                    }
                                    {vurdering.riskAssessment.speciesStatus != null && vurdering.riskAssessment.speciesStatus.indexOf("C") > -1 &&
                                    <li>{labels.General.speciesInNorwegianNature}</li> }

                                    {(vurdering.riskAssessment.speciesStatus == "C3–E" || vurdering.riskAssessment.speciesStatus == "C2") &&
                                        <li>{labels.General.reproductionInNorwegianNature}</li> }

                                    {vurdering.riskAssessment.speciesStatus == "C3–E" &&
                                    <li> {labels.General.establishmentInNorwegianNature}</li> }
                                </ul>	
                                </div>
                                <div className="yearsAndCheckboxes">
                                <ul className="listOfYears">
                                { vurdering.riskAssessment.speciesStatus != null && vurdering.riskAssessment.speciesStatus != "A" &&
                                    <p>{labels.General.uncertainity}</p>	
                                }
                                {vurdering.riskAssessment.speciesStatus != "A" && vurdering.riskAssessment.speciesStatus != null &&
                                    <li> 
                                    <Xcomp.Number                            
                                        observableValue={[vurdering.riskAssessment, "yearFirstIndoors"]}
                                        integer
                                    />    
                                    <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstIndoorsInsecure"]} /> 
                                    </li>}
                                    {vurdering.riskAssessment.speciesStatus != "A" && vurdering.riskAssessment.speciesStatus != null &&                                   
                                    <li>
                                    <Xcomp.Number                            
                                        observableValue={[vurdering.riskAssessment, "yearFirstReproductionIndoors"]}
                                        integer
                                    />    
                                    <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstReproductionIndoorsInsecure"]} /> 
                                    </li> }

                                    {vurdering.riskAssessment.bruksart == true && vurdering.riskAssessment.speciesStatus != "A" && vurdering.riskAssessment.speciesStatus != "B1"
                                     && vurdering.riskAssessment.speciesStatus != null &&
                                    <li>
                                    <Xcomp.Number                            
                                        observableValue={[vurdering.riskAssessment, "yearFirstProductionOutdoors"]}
                                        integer
                                    />    
                                    <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstProductionOutdoorsInsecure"]} /> 
                                    </li>}
                                    {vurdering.riskAssessment.bruksart == true && (vurdering.riskAssessment.speciesStatus == "C2" || vurdering.riskAssessment.speciesStatus == "C3–E") &&
                                    <li>
                                    <Xcomp.Number                            
                                        observableValue={[vurdering.riskAssessment, "yearFirstReproductionOutdoors"]}
                                        integer
                                    />    
                                    <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstReproductionOutdoorsInsecure"]} /> 
                                    </li> }
                                    
                                    {vurdering.riskAssessment.speciesStatus != null && vurdering.riskAssessment.speciesStatus.indexOf("C") > -1 && 
                                        <li>                                    
                                        <Xcomp.Number                            
                                            observableValue={[vurdering.riskAssessment, "yearFirstNature"]}
                                            integer
                                        />    
                                        <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstNatureInsecure"]} /> 
                                        </li> }
                                    { (vurdering.riskAssessment.speciesStatus == "C3–E" || vurdering.riskAssessment.speciesStatus == "C2") && 
                                        <li>
                                        <Xcomp.Number                            
                                            observableValue={[vurdering.riskAssessment, "yearFirstReproductionNature"]}
                                            integer
                                        />    
                                        <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstReproductionNatureInsecure"]} /> 
                                        </li> }
                                    {vurdering.riskAssessment.speciesStatus == "C3–E" && 
                                        <li>
                                        <Xcomp.Number                            
                                            observableValue={[vurdering.riskAssessment, "yearFirstEstablishedNature"]}
                                            integer
                                        />    
                                        <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstEstablishedNature"]} /> 
                                        </li>}
                                </ul>
                                </div>
                            </div>		

                            {vurdering.riskAssessment.speciesStatus != "A" && vurdering.riskAssessment.speciesStatus != null &&                            	
                                <p>{labels.General.uncertainityMoreThanFiveYears}</p> }

                            {vurdering.riskAssessment.speciesStatus == "A" && 
                                <p>{labels.General.foundInNorwayBefore}</p> }
                            {(vurdering.riskAssessment.speciesStatus == "B1" || vurdering.riskAssessment.speciesStatus == "B2" ) &&
                                <p>{labels.General.furtherInformationRegardingSpecies}</p>}
                            {(vurdering.riskAssessment.speciesStatus == "C0" || vurdering.riskAssessment.speciesStatus == "C1" ) &&
                                <p>{labels.General.furtherInformationRegardingReproductionOfSpecies}</p>
                            }
                            {vurdering.riskAssessment.speciesStatus != "C3–E" && vurdering.riskAssessment.speciesStatus != "C2" && vurdering.riskAssessment.speciesStatus != null &&
                                <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'furtherInfo']}/> }
                            </div> : null }
                </div>
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

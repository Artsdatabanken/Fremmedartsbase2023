import React from 'react';
import {observer, inject} from 'mobx-react';
import PropTypes from 'prop-types';
import config from '../../config';
// import RadioGroup from './radioGroup'
import * as Xcomp from './observableComponents';
import DomesticObservedAndEstablished from './31ArtensStatus/DomesticObservedAndEstablished';

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
export default class vurdering31ArtensStatus extends React.Component {
// @observer
//     constructor(props) {
//         super(props)

//     }



    render() {
        const {appState:{assessment}, appState} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels



        // console.log("labels" + JSON.stringify(labels.FirstObservation))

        const koder = appState.koder.Children
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
                    ? <h3>Artens status</h3>
                    : <br/>}
                <div className="well">
                    <b>Er arten fremmed? </b>
                    <p>Ved usikkerhet velges svaret som det er sannsynlighetsovervekt for.</p>
                    <Xcomp.Radio kode={"YES"} observableValue={[vurdering.riskAssessment, "isAlienSpecies"]} label={"JA"} />
                    <Xcomp.Bool observableValue={[vurdering.riskAssessment, "isRegionallyAlien"]} label={"regionalt fremmed"} />
                    <Xcomp.Radio kode={"NO"} observableValue={[vurdering.riskAssessment, "isAlienSpecies"]} label={"NEI"} />
                    <p>Beskriv eventuell usikkerhet vedrørende artens status som fremmed:</p>
                    <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'isAlien']}/>
                    <b>Er taksonet omfatta av vurderinga til et annet takson?  </b>
                    <Xcomp.Radio kode={"Connected"} observableValue={[vurdering.riskAssessment, "connected"]} label={"Taksonet vurderes sammen med et annet takson. "} />
                    <p>Oppgi navnet på dette taxonet:</p>
                    <Xcomp.String observableValue={[vurdering.riskAssessment, 'connectedTaxon1']} placeholder={labels.General.searchSpecies} />
                    
                    <Xcomp.Radio kode={"Shared"} observableValue={[vurdering.riskAssessment, "connected"]} label={"Taksonet vurderes ikke, men deler vurderinga til et annet takson. "} />
                    <p>Oppgi navnet på dette taxonet:</p>
                    <Xcomp.String observableValue={[vurdering.riskAssessment, 'connectedTaxon2']} placeholder={labels.General.searchSpecies} />
                    <div className="statusField"><b> Er arten en bruksart?</b> <Xcomp.Bool observableValue={[vurdering.riskAssessment, "bruksart"]} /> </div>
                    <b>Hvilken status har arten i Norge? </b>
                    <p>Merk av den høyeste (øverste) kategorien som oppfylles av arten i Norge i dag:</p>
                    
                    <Xcomp.Radio kode={"C3–E"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={"Arten er etablert (C3–E)"} />
                    <Xcomp.Radio kode={"C2"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={"Arten produserer levedyktig avkom utendørs og uten hjelp og kan overleve vinteren (C2)"} />
                    <Xcomp.Radio kode={"C1"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={"Arten kan overleve vinteren utendørs og uten hjelp (C1)"} />
                    <Xcomp.Radio kode={"C0"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={"Arten er dokumentert fra norsk natur (C0)"} />
                    <Xcomp.Radio kode={"B2"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={"Arten forekommer utendørs på sitt eget produksjonsareal (B2)"} />
                    <Xcomp.Radio kode={"B1"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={"Arten forekommer innendørs eller i lukkede installasjoner (B1)"} />
                    <Xcomp.Radio kode={"A"} observableValue={[vurdering.riskAssessment, "speciesStatus"]} label={"Arten forekommer ikke i Norge (A)"} />
                        
                    <p>Koder i parentes angir «etableringskategoriene» ifølge internasjonal standardisering (Blackburn mfl. 2011).</p>
                    <div className="statusField">
                        <b>Var arten etablert per 1800? </b>
                        <Xcomp.Bool observableValue={[vurdering.riskAssessment, "estBefore1800"]} />
                    </div>
                    
                    <p>Ved usikkerhet avgjør sannsynlighetsovervekt.</p>
                    <p>Beskriv eventuell usikkerhet vedrørende artens etableringstidspunkt:</p>
                    <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'establishedBefore1800']}/>
                    <div className="statusField">
                        <b> Har arten tidligere vært feilbestemt? </b>                
                        <Xcomp.Bool observableValue={[vurdering.riskAssessment, "wrongAssessed"]} />  
                        
                    </div>
                    
                    <b>Har arten </b>
                    <Xcomp.Radio kode={"VærtFremmed"} observableValue={[vurdering.riskAssessment, "changedFromAlien"]} label={"vært fremmed, men har nå etablert minst én stedegen bestand"} />
                    <Xcomp.Radio kode={"VærtAntattFremmed"} observableValue={[vurdering.riskAssessment, "changedFromAlien"]} label={"vært antatt å være fremmed, men kunnskapsgrunnlaget/tolkninga er endra"} />
                    <p>Beskriv hva som ligger til grunn for endringa i artens status:</p>
                    <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'changedAssessment']}/>
                    <br/>
                    <h2>Konklusjon</h2>
                    <p>Arten skal risikovurderes.</p>
                    <p>Arten skal ikke risikovurderes.</p>
                    <br/>
                    <h3>Første observasjon av arten</h3>
                    
                    <div className="statusField">
                        	
                        <div className="firstObs">
                        <p>Angi årstallet for første observasjon i Norge av... </p>	
                        <ul>
                            <li>individ innendørs (hvis relevant):                             
                            </li>
                            <li>selvstendig reproduksjon innendørs (hvis relevant):                            
                            </li>
                            <li>individ på artens eget produksjonsareal utendørs:                             
                            </li>
                            <li>selvstendig reproduksjon på artens eget produksjonsareal utendørs:
                            </li>
                            <li>individ i norsk natur:
                            </li>
                            <li>selvstendig reproduksjon i norsk natur:                            
                            </li>
                            <li>etablering i norsk natur:                            
                            </li>
                        </ul>	
                        </div>
                        <div className="yearsAndCheckboxes">
                        <ul className="listOfYears">
                        <p>Usikkerhet</p>	
                            <li> 
                            <Xcomp.Number                            
                                observableValue={[vurdering.riskAssessment, "yearFirstIndoors"]}
                                integer
                            />    
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstIndoorsInsecure"]} /> 
                            </li>
                            <li>
                            <Xcomp.Number                            
                                observableValue={[vurdering.riskAssessment, "yearFirstReproductionIndoors"]}
                                integer
                            />    
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstReproductionIndoorsInsecure"]} /> 
                            </li>
                            <li>
                            <Xcomp.Number                            
                                observableValue={[vurdering.riskAssessment, "yearFirstProductionOutdoors"]}
                                integer
                            />    
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstProductionOutdoorsInsecure"]} /> 
                            </li>
                            <li>
                            <Xcomp.Number                            
                                observableValue={[vurdering.riskAssessment, "yearFirstReproductionOutdoors"]}
                                integer
                            />    
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstReproductionOutdoorsInsecure"]} /> 
                            </li>
                            <li>
                            <Xcomp.Number                            
                                observableValue={[vurdering.riskAssessment, "yearFirstNature"]}
                                integer
                            />    
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstNatureInsecure"]} /> 
                            </li>
                            <li>
                            <Xcomp.Number                            
                                observableValue={[vurdering.riskAssessment, "yearFirstReproductionNature"]}
                                integer
                            />    
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstReproductionNatureInsecure"]} /> 
                            </li>
                            <li>
                            <Xcomp.Number                            
                                observableValue={[vurdering.riskAssessment, "yearFirstEstablishedNature"]}
                                integer
                            />    
                            <Xcomp.Bool observableValue={[vurdering.riskAssessment, "yearFirstEstablishedNature"]} /> 
                            </li>
                        </ul>
                        </div>
                    </div>			
                    <p>Hvis usikkerheten er større enn ± 5 år, sett et kryss til høyre for årstallet.</p>

                    <p>Om arten tidligere har blitt funnet i Norge, beskriv tidspunkt og status:</p>
                    <p>Eventuelle utdypende opplysninger om observasjoner av arten, f.eks. om den tidligere er funnet i norsk natur:</p>
                    <p>Eventuelle utdypende opplysninger om observasjoner av arten, f.eks. om den tidligere er funnet reproduserende i norsk natur:</p>
                    <Xcomp.HtmlString observableValue={[vurdering.riskAssessment, 'furtherInfo']}/>
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

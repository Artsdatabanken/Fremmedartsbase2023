import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {autorun, extendObservable, observable} from 'mobx';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'
import NaturtypeTable from './51Naturtyper/naturtypeTable';
import HabitatTable from './51Naturtyper/habitatTable';
import NewNaturetype from './51Naturtyper/newNaturetype';
import ScoreUnsure from './51Naturtyper/scoreUnsure';
// import NaturtypeSelector from './naturtypeSelector';
import RedlistedNaturetypeTable from './51Naturtyper/redlistedNaturetypeTable';
import NewRedlistedNaturetype from './51Naturtyper/newRedlistedNaturetype';
// import BsModal from './bootstrapModal' import RedlistedNaturtypeSelector from
// './51Naturtyper/redlistedNaturetypeSelector';

@inject("appState")
@observer
export default class Assessment51Naturtyper extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment}, appState} = this.props;
        
        // extendObservable(this, { })
        this.addNaturtype = (nyNt) => {
            assessment
                .impactedNatureTypes
                .push(nyNt)
        }
        this.addRedlistedNaturetype = (nyNt) => {
            assessment
                .redlistedNatureTypes
                .push(nyNt)

            // alert("add new redlisted nature type: " + nyNt.RedlistedNatureTypeName + " -
            // " + nyNt.Category)
        }
    }

    render() {
        const {appState:{assessment}, appState} = this.props;
        const riskAssessment = assessment.riskAssessment // fabModel.activeRegionalRiskAssessment
        // const labels = config.labels.NatureType
        
        const fabModel = appState
        const labels = appState.codeLabels
        const koder = appState.koder

        
        // const labels = appState.kodeLabels
        const ntLabels = labels.NatureTypes

        // console.log("keys: " + JSON.stringify(Object.keys(assessment)))




        const critC = getCriterion(riskAssessment, 0, "C")
        const critF = getCriterion(riskAssessment, 1, "F")
        const critG = getCriterion(riskAssessment, 1, "G")
        critC.auto = false
        critF.auto = false
        critG.auto = false
        const nts = appState.naturtyper
        const doms = appState.dominansSkog
        const canRenderTable = !!appState.naturtypeLabels && (!!appState.dominansSkog || appState.language === "SV")
        return (
            <div>
              {/*  <h4>{ntLabels.colonizedAreaHeading}</h4>     */}     
              <fieldset className="well">     
                <NewNaturetype
                    appState={appState}
                    addNaturtype={this.addNaturtype}
                    labels={labels}
                    codes={koder.redlistedNaturetypes}
                    header={ntLabels.chooseRL2018}/> 
                </fieldset>
                <fieldset className="well">               
               <NewNaturetype
                    appState={appState}
                    addNaturtype={this.addNaturtype}
                    labels={labels}
                    codes={koder.naturtyperNIN2}
                    header={ntLabels.chooseNT} />
                </fieldset> 
                <fieldset className="well">   
                <NaturtypeTable
                    naturetypes={assessment.impactedNatureTypes}
                    appState={appState}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    codes={koder}
                    fabModel={appState}
                    desc={"Anslå kolonisert areal i de naturtypene arten er observert i, beskriv artens påvirkning i naturtypen og anslå hvor stor andel av naturtypen som blir påvirket. Det skal være sannsynlighetsovervekt for at valgt tilstandsendring skjer."}/>
                </fieldset>  

                <fieldset className="well">
                    <h4>{ntLabels.critCHeading}</h4>
                   {/* <p>{ntLabels.score}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresC}
                                firstValue={"scoreC"}
                                // secondValue={"unsureC"}/>*/}
                   {/* <b>{ntLabels.assessmentBackground}</b>
                    <Xcomp.MultiselectArray
                                observableValue={[riskAssessment, 'backgroundC']} 
                                codes={koder.assessmentBackgrounds}
                    mode="check"/>*/}

                    
                    <Criterion criterion={critC} mode="noheading"/>
                </fieldset>

                <fieldset className="well">   
                <NaturtypeTable
                    naturetypes={assessment.impactedNatureTypes}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    codes={koder}
                    fabModel={appState}
                    desc={"Anslå kolonisert areal i de naturtypene arten er observert i, beskriv artens påvirkning i naturtypen og anslå hvor stor andel av naturtypen som blir påvirket. Det skal være sannsynlighetsovervekt for at valgt tilstandsendring skjer."}/>
                </fieldset>  

                <fieldset className="well">
                    <h4>{ntLabels.critFHeading}</h4>
                   {/* <p>{critF.info}</p>
                    <p>{ntLabels.score}</p>*/}
                   {/* <ScoreUnsure appState={appState}
                                 critScores={koder.scoresF}
                                 firstValue={"scoreF"}
                                 secondValue={"unsureF"}/> */}
                   {/* <b>{ntLabels.assessmentBackground}</b>
                    <Xcomp.MultiselectArray
                                observableValue={[riskAssessment, 'backgroundF']} 
                                codes={koder.assessmentBackgrounds}
                   mode="check"/>*/}

                    {riskAssessment.backgroundF.indexOf("ObservationAbroad") > -1 || riskAssessment.backgroundF.indexOf("WrittenDocumentationAbroad") > -1 ? 
                    <div>
                        <p>{ntLabels.natureAffectedAbroad}</p>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'natureAffectedAbroadF']}/>
                    </div> : null}
                   
                    
                    {/*<div>
                        <span>{appState.evaluationContext.name}:
                        </span>
                        <Xcomp.Bool
                            label='Dokumentert'
                            observableValue={[riskAssessment, 'threatenedNatureTypesDomesticDocumented']}/>
                        <Xcomp.Bool
                            label='Observert'
                            observableValue={[riskAssessment, 'threatenedNatureTypesDomesticObserved']}/>
                        <span>{ntLabels.threatenedNatureTypesChangeDomestic} {appState.evaluationContext.nameWithPreposition}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'threatenedNatureTypesAffectedDomesticDescription']}/>
                    </div>
                    <br/>*/}
                    <Criterion criterion={critF} mode="noheading"/>
                    
                   {/* <div>
                        <span>{ntLabels.abroad}:
                        </span>
                        <Xcomp.Bool
                        label={ntLabels.threatenedNatureTypesForeignDocumented}
                            observableValue={[riskAssessment, 'threatenedNatureTypesForeignDocumented']}/> 
                        <br/>
                        <span>{ntLabels.threatenedNatureTypesChangeAbroad}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'threatenedNatureTypesAffectedAbroadDescription']}/>
                   </div> */}
                </fieldset>
                <fieldset className="well">   
                <NaturtypeTable
                    naturetypes={assessment.impactedNatureTypes}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    codes={koder}
                    fabModel={appState}
                    desc={"Anslå kolonisert areal i de naturtypene arten er observert i, beskriv artens påvirkning i naturtypen og anslå hvor stor andel av naturtypen som blir påvirket. Det skal være sannsynlighetsovervekt for at valgt tilstandsendring skjer."}/>
                </fieldset>  
                <fieldset className="well">
                    <h4>{ntLabels.critGHeading}</h4>
                    
                    {/*<p>{critG.info}</p>
                    <p>{ntLabels.score}</p>*/}
                    {/*<ScoreUnsure appState={appState}
                                critScores={koder.scoresG}
                                firstValue={"scoreG"}
                                secondValue={"unsureG"}/> */}
                   {/* <b>{ntLabels.assessmentBackground}</b>
                    <Xcomp.MultiselectArray
                                observableValue={[riskAssessment, 'backgroundG']} 
                                codes={koder.assessmentBackgrounds}
                mode="check"/> */}

                    {riskAssessment.backgroundG.indexOf("ObservationAbroad") > -1 || riskAssessment.backgroundG.indexOf("WrittenDocumentationAbroad") > -1 ? 
                    <div>
                        <p>{ntLabels.natureAffectedAbroad}</p>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'natureAffectedAbroadG']}/>
                    </div> : null }
                    
                   {/* <div>
                        <span>{appState.evaluationContext.name}:
                        </span>
                        <Xcomp.Bool
                            label='Dokumentert'
                            observableValue={[riskAssessment, 'commonNatureTypesDomesticDocumented']}/>
                        <Xcomp.Bool
                            label='Observert'
                            observableValue={[riskAssessment, 'commonNatureTypesDomesticObserved']}/>
                        <span>{ntLabels.commonNatureTypesAffectedDomestic} {appState.evaluationContext.nameWithPreposition}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'commonNatureTypesAffectedDomesticDescription']}/>
                    </div>
                   <br/> */}
                    <Criterion criterion={critG} mode="noheading"/>
                    
                   {/* <div>
                        <span>{ntLabels.abroad}:
                        </span>
                        <Xcomp.Bool
                        label={ntLabels.commonNatureTypesForeignDocumented}
                            observableValue={[riskAssessment, 'commonNatureTypesForeignDocumented']}/> 
                        <br/>
                        <span>{ntLabels.commonNatureTypesAffectedAbroad}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'commonNatureTypesAffectedAbroadDescription']}/>
                   </div>*/}
                </fieldset>
                
               <h4>{ntLabels.effectOnThreatenedNatureTypes }</h4>
                <br/>
                <NewRedlistedNaturetype
                    appState={appState}
                    addNaturtype={this.addRedlistedNaturetype}
                    labels={labels}/>
                <br/>
                <br/>
                <RedlistedNaturetypeTable
                    naturetypes={assessment.redlistedNatureTypes}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    fabModel={appState}/>
            
                <br/>
                
                <fieldset className="well">
                    <h4>{ntLabels.habitat}</h4>
                    <p>{ntLabels.chooseHabitat}</p>
                    <HabitatTable
                     canRenderTable={canRenderTable}
                     labels={labels}
                     appState={appState}/>
                   {/* <div>
                        <Xcomp.Bool
                            label={ntLabels.usesLivingSpeciesAsHabitat}
                            observableValue={[assessment, 'usesLivingSpeciesAsHabitat']}/> 
                        {assessment.usesLivingSpeciesAsHabitat ?
                        <Xcomp.String
                            label={ntLabels.usesLivingSpeciesAsHabitatScientificName}
                            observableValue={[assessment, 'usesLivingSpeciesAsHabitatScientificName']}/> :
                        null }
                        </div> */}
                </fieldset>
                <fieldset className="well">
                    <h4>{ntLabels.mainEcosystem}</h4>     
                    <Xcomp.MultiselectArray
                                className="mainEcosystem"
                                observableValue={[riskAssessment, 'hovedøkosystem']} 
                                codes={koder.hovedøkosystemer}
                                mode="check"/>
          
                </fieldset>
                <br/>
            </div>
        );
    }
}

// Vurdering40Naturtyper.propTypes = {
//     // fabModel: PropTypes.object.isRequired,
//     appState: PropTypes.object.isRequired,
//     assessment: PropTypes.object.isRequired
// }

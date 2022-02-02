import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
// import {action, autorun, autorunAsync, extendObservable, observable, toJS} from 'mobx';
import {action, extendObservable, runInAction, toJS} from 'mobx'

import config from '../../config';
import {loadData} from './../../apiService'; 
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'

import SpeciesSpeciesTable from './52Okologiskeffekt/SpeciesSpeciesTable'
import SpeciesNaturetypeTable from './52Okologiskeffekt/SpeciesNaturetypeTable'


import ScoreUnsure from './51Naturtyper/scoreUnsure'
import HostParasiteTable from './52Okologiskeffekt/HostParasiteTable'
//import createTaxonSearch from './52Okologiskeffekt/createTaxonSearch'
import createTaxonSearch from '../createTaxonSearch'


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

@inject("appState")
@observer
export default class Assessment62Okologiskeffekt extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment}, appState:{assessment:{riskAssessment}}, appState} = this.props;
        const evaluationContext = appState.evaluationContext
        const labels = appState.codeLabels
        const koder = appState.koder
        extendObservable(this, {
            // showModal: false,
            newSSITS: {
                id: "newSpeciesSpeciesInteractionsTaxonSearch",
                scientificName: "",
                scientificNameId: "",
                scientificNameAuthor: "",
                vernacularName: "",
                taxonRank: "",
                taxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                domesticOrAbroad : "",
                redListCategory: "", 
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                effect : "Weak",
                scale: "Limited",
                status: "NewAlien",
                interactionType : "CompetitionSpace", 
                //interactionType : [], 
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }, 
            newGTD: {
                id: "newGeneticTransferDocumentedTaxonSearch",
                scientificName: "",
                scientificNameId: "",
                scientificNameAuthor: "",
                vernacularName: "",
                taxonRank: "",
                taxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                domesticOrAbroad : "",
                redListCategory: "", 
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                effect : "Weak",                 
                scale: "Limited",
                status: "NewAlien",
                interactionType : "",
                //interactionType : [], 
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }, 
            newHPI: {
                id: "newHostParasiteInformationsTaxonSearch",
                scientificName: "",
                scientificNameId: "",
                scientificNameAuthor: "",
                vernacularName: "",
                taxonRank: "",
                taxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                domesticOrAbroad : "",
                redListCategory: "", 
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                scale: "Limited",
                status: "NewAlien",
                parasiteScientificName : "",
                parasiteVernacularName : "",
                parasiteEcoEffect : "1", 
                parasiteNewForHost : false, 
                parasiteIsAlien : false, 
                diseaseConfirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            },
            newSNITS: {
                niNVariation: [],
                niNCode : "",
                naturetypes: [],
                name: "",
                redListCategory: "", 
                domesticOrAbroad : "",
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                scale: "Limited",
                //status: "NewAlien",
                effect : "Weak",
                interactionType : "CompetitionSpace", 
                //interactionType : [], 
                longDistanceEffect : false, 
                confirmedOrAssumed : false,                
                basisOfAssessment: [],
                interactionTypes: [],
                // taxonSearchString: "",
                // taxonSearchResult: [], 
                // taxonSearchWaitingForResult: false - should not be observable
            } 
        })

        this.addSSITS = action(() => {
            const list = riskAssessment.speciesSpeciesInteractions //ThreatenedSpecies;
            const newItem = this.newSSITS;
            const clone = toJS(newItem);
            // console.log("Clone: " + JSON.stringify(clone))
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            list.push(clone)
            newItem.scientificName = ""
            newItem.scientificNameId = ""
            newItem.scientificNameAuthor = ""
            newItem.vernacularName = ""
            newItem.taxonRank = ""
            newItem.taxonId = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
            newItem.interactionType = "CompetitionSpace" 
            //newItem.interactionType = []
            newItem.effect = "Weak" 
            newItem.scale = "Limited" 
            newItem.effectLocalScale = false 
            newItem.longDistanceEffect = false 
            newItem.confirmedOrAssumed = false
            newItem.domesticOrAbroad = ""
            newItem.taxonSearchString = ""
            newItem.taxonSearchResult.replace([])
            newItem.basisOfAssessment = []
            newItem.interactionTypes = []
            newItem.taxonSearchWaitingForResult = false
        })
        this.addSNITS = action(() => {
            const list = riskAssessment.speciesNaturetypeInteractions //ThreatenedSpecies;
            const newItem = this.newSNITS;
            const clone = toJS(newItem);
            console.log("Clone: " + JSON.stringify(clone))
            // clone.taxonSearchString = undefined
            // clone.taxonSearchResult = undefined
            list.push(clone)
//            newItem.NiNCode = "",  Dropdown inneholder fortsatt samme naturtype - beholder derfor koden
            
           // newItem.niNCode = "",
            newItem.niNVariation.clear(),
            newItem.name = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
            //newItem.interactionType = []
            newItem.interactionType = "CompetitionSpace" 
            newItem.effect = "Weak"              
            newItem.scale = "Limited" 
            newItem.effectLocalScale = false 
            newItem.longDistanceEffect = false 
            newItem.confirmedOrAssumed = false
            newItem.domesticOrAbroad = ""
            newItem.taxonSearchString = ""
            newItem.basisOfAssessment = []
            newItem.interactionTypes = []

            // newItem.taxonSearchResult.replace([])
            // newItem.taxonSearchWaitingForResult = false
        })
        this.addGTD = () => {
            const list = riskAssessment.geneticTransferDocumented;
            const newItem = this.newGTD;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            list.push(clone)
            newItem.scientificName = ""
            newItem.scientificNameId = ""
            newItem.scientificNameAuthor = ""
            newItem.vernacularName = ""
            newItem.taxonRank = ""
            newItem.taxonId = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
            //newItem.interactionType = []
            newItem.interactionType = ""
            newItem.effect = "Weak"  
            newItem.scale = "Limited" 
            newItem.effectLocalScale = false 
            newItem.basisOfAssessment = []
            newItem.interactionTypes = []
            newItem.longDistanceEffect = false
            newItem.confirmedOrAssumed = false
            newItem.domesticOrAbroad = "" 
            newItem.taxonSearchString = ""
            newItem.taxonSearchResult.replace([])
            newItem.taxonSearchWaitingForResult = false
        }
        this.addHPI = () => {
            const list = riskAssessment.hostParasiteInformations;
            const newItem = this.newHPI;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined

// console.log("addHPI: " + JSON.stringify(clone))

            list.push(clone)
            newItem.scientificName = ""
            newItem.scientificNameId = ""
            newItem.scientificNameAuthor = ""
            newItem.vernacularName = ""
            newItem.taxonRank = ""
            newItem.taxonId = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
            newItem.parasiteScientificName = "" 
            newItem.parasiteVernacularName = "" 
            newItem.parasiteEcoEffect = "1"
            newItem.effectLocalScale = false 
            newItem.parasiteNewForHost = false 
            newItem.parasiteIsAlien = false 
            newItem.newHost = false
            newItem.diseaseConfirmedOrAssumed = false 
            newItem.domesticOrAbroad = "" 
            newItem.taxonSearchString = ""
            newItem.taxonSearchResult.replace([])
            newItem.basisOfAssessment = []
            newItem.interactionTypes = []
            newItem.taxonSearchWaitingForResult = false
        }

        createTaxonSearch(this.newSSITS, evaluationContext
            //, tax => tax.rlCategory != null 
            //&& tax.existsInCountry
            )
        // createTaxonSearch(this.newSSIDS, "N")
        //createTaxonSearch(this.newGTD, evaluationContext, tax => tax.existsInCountry)
        createTaxonSearch(this.newGTD, evaluationContext)

        //createTaxonSearch(this.newHPI, evaluationContext, tax => tax.existsInCountry)
        createTaxonSearch(this.newHPI, evaluationContext)
    }

    render() {
        const {appState:{assessment}, appState:{assessment:{riskAssessment}}, appState, evaluationContext} = this.props;
        // const {riskAssessment, viewModel, fabModel, evaluationContext} = this.props;
        // const labels = fabModel.kodeLabels
        const labels = appState.codeLabels
        const koder = appState.koder
        const nbsp = "\u00a0"
        const crit52D = getCriterion(riskAssessment, 1 , "D")
        const crit52E = getCriterion(riskAssessment, 1 , "E")
        const crit52F = getCriterion(riskAssessment, 1 , "F")
        const crit52G = getCriterion(riskAssessment, 1 , "G")
        const crit52H = getCriterion(riskAssessment, 1 , "H")
        const crit52I = getCriterion(riskAssessment, 1 , "I")
        const ntLabels = labels.NatureTypes
        runInAction(() => {

        crit52D.auto = true
        crit52E.auto = true
        crit52F.auto = false
        crit52G.auto = false
        crit52H.auto = true
        crit52I.auto = true
        })
        //console.log(appState.userContext.readonly)
        return(
            <div>

                {config.showPageHeaders ? <h3>Økologisk effekt</h3> : <br />}
                <fieldset className="well">
                    <h2>{labels.DEcrit.mainHeading}</h2>
                    <h4>{labels.DEcrit.heading}</h4>
                    <p>Beskriv artens interaksjon(er) med stedegne og andre arter som har blitt vurdert for rødlisting. Det skal være sannsynlighetsovervekt for interaksjonen</p>
                    <hr/>
                    <SpeciesSpeciesTable list={riskAssessment.speciesSpeciesInteractions} newItem={this.newSSITS} addNewItem={this.addSSITS} koder={koder} labels={labels} disabled={appState.userContext.readonly} showRedlist showKeyStoneSpecie showEffect showInteractionType showConfirmedOrAssumed/>
                    
                    
                    <hr/>
                    
                    <SpeciesNaturetypeTable list={riskAssessment.speciesNaturetypeInteractions} natureTypes={assessment.impactedNatureTypes} newItem={this.newSNITS} addNewItem={this.addSNITS}  koder={koder} labels={labels} disabled={appState.userContext.readonly} naturtypeLabels={appState.naturtypeLabels } showKeyStoneSpecie showEffect showInteractionType />

                    <hr/>

                    <Xcomp.HtmlString observableValue={[riskAssessment, 'speciesSpeciesInteractionsSupplementaryInformation']} label="Utfyllende informasjon (f.eks. hvilke(n) artsgruppe i naturtypen påvirkes og hvordan blir disse generelt påvirket):" />

                    
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={crit52D} hideInfo={true} disabled={appState.userContext.readonly}/>

        

                   
                   {/* <b>curr{crit52D.Value}{crit52D.currentValueLabel}</b>
                   
                   <ScoreUnsure appState={appState}
                                critScores={koder.scoresD}
                                firstValue={"scoreD"}
                                secondValue={"unsureD"}/> */}
                     <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "DCritInsecurity"]}
                                label={labels.DEcrit.insecurity}
                            />                      
                    </fieldset>
                    <fieldset className="well">
                    <Criterion criterion={crit52E} hideInfo={true} disabled={appState.userContext.readonly}/>
                   
                   {/* <ScoreUnsure appState={appState}
                                critScores={koder.scoresE}
                                firstValue={"scoreE"}
                                secondValue={"unsureE"}/>*/}
                     <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "ECritInsecurity"]}
                                label={labels.DEcrit.insecurity}
                            />                      
                </fieldset>
                <fieldset className="well">
                    
                    <Criterion criterion={crit52F} disabled={true}/>
                    
                   {/* 
                   <p>{ntLabels.scoreSummary}</p>
                   <ScoreUnsure appState={appState}
                                critScores={koder.scoresF}
                                firstValue={"scoreF"}
                                secondValue={"unsureF"}/>*/}
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={crit52G} disabled={true}/>
                    {/*<p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresG}
                                firstValue={"scoreG"}
                            secondValue={"unsureG"}/>*/}
                </fieldset> 
                <fieldset className="well">
                    <h4>{crit52H.heading}</h4>
                    <p>{crit52H.info}</p>
                    <SpeciesSpeciesTable list={riskAssessment.geneticTransferDocumented} newItem={this.newGTD} addNewItem={this.addGTD} koder={koder} labels={labels} disabled={appState.userContext.readonly} showKeyStoneSpecie showInteractionType showConfirmedOrAssumed HCrit />
                    <hr/>

                   {/* <p>{ntLabels.score}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresH}
                                firstValue={"scoreH"}
                        secondValue={"unsureH"}/> */}
                   
                    <Criterion criterion={crit52H} mode="noheading" disabled={appState.userContext.readonly}/>
                     <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "HCritInsecurity"]}
                                label={labels.DEcrit.insecurity}
                            />                      
                    {/*{crit52H.majorUncertainty ?
                    <div>
                        <span>Beskrivelse</span>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'geneticTransferDomesticDescription']} />
                    </div> : 
                    null}*/}
                    
                    {/*<p>HGeneticTransferLevel: {riskAssessment.HGeneticTransferLevel}</p>*/}
                </fieldset>
                <fieldset className="well">
                    <h4>{crit52I.heading} </h4>
                    <p>{crit52I.info}</p>
                    <HostParasiteTable list={riskAssessment.hostParasiteInformations} newItem={this.newHPI} addNewItem={this.addHPI} koder={koder} labels={labels} disabled={appState.userContext.readonly} showKeyStoneSpecie />
                    <hr/>
                   {/* <p>{ntLabels.score}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresI}
                                firstValue={"scoreI"}
                                secondValue={"unsureI"}/>*/}

                    
                    <Criterion criterion={crit52I} mode="noheading" disabled={appState.userContext.readonly}/>
                     <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "ICritInsecurity"]}
                                label={labels.DEcrit.insecurity}
                            />                      
                    {/*{crit52I.majorUncertainty ?
                    <div>
                        <span>Beskrivelse</span>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'vectorBiologicalDiseaseSpreadingDomesticDescription']} />
                    </div> : 
                    null }*/}
                    
                </fieldset>
            </div>
        );
    }
}

                // Vurdering52Okologiskeffekt.propTypes = {
                //     viewModel: PropTypes.object.isRequired,
                //     riskAssessment: PropTypes.object.isRequired
                // }



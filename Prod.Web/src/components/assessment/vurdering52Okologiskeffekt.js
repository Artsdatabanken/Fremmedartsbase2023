import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
// import {action, autorun, autorunAsync, extendObservable, observable, toJS} from 'mobx';
import { extendObservable,  toJS} from 'mobx'

import config from '../../config';
// import {loadData} from '../stores/apiService'; 
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'

import SpeciesSpeciesTable from './52Okologiskeffekt/SpeciesSpeciesTable'
import SpeciesNaturetypeTable from './52Okologiskeffekt/SpeciesNaturetypeTable'


import ScoreUnsure from './40Naturtyper/scoreUnsure'
import HostParasiteTable from './52Okologiskeffekt/HostParasiteTable'
import createTaxonSearch from './52Okologiskeffekt/createTaxonSearch'


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

@inject("appState")
@observer
export default class Vurdering52Okologiskeffekt extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment:{riskAssessment}}, appState, evaluationContext} = this.props;
        extendObservable(this, {
            // showModal: false,
            newSSITS: {
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
                interactionType : "CompetitionSpace", 
                //interactionType : [], 
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }, 
            newGTD: {
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
                interactionType : "",
                //interactionType : [], 
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }, 
            newHPI: {
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
                // // // // NiNCode: riskAssessment.vurderingAllImpactedNatureTypes.length > 0
                // // // //     ? riskAssessment.vurderingAllImpactedNatureTypes[0].NiNCode
                // // // //     : "",
                niNVariation: [],
                naturetypes: riskAssessment.vurderingAllImpactedNatureTypes,
                redListCategory: "", 
                domesticOrAbroad : "",
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                scale: "Limited",
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

        this.addSSITS = () => {
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
        }
        this.addSNITS = () => {
            const list = riskAssessment.speciesNaturetypeInteractions //ThreatenedSpecies;
            const newItem = this.newSNITS;
            const clone = toJS(newItem);
            // console.log("Clone: " + JSON.stringify(clone))
            // clone.taxonSearchString = undefined
            // clone.taxonSearchResult = undefined
            list.push(clone)
//            newItem.NiNCode = "",  Dropdown inneholder fortsatt samme naturtype - beholder derfor koden
            newItem.niNVariation.clear(),

            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
            //newItem.interactionType = []
            newItem.interactionType = "CompetitionSpace" 
            newItem.effect = "Weak"              
            newItem.scale = "Limited" 
            newItem.EffectLocalScale = false 
            newItem.longDistanceEffect = false 
            newItem.confirmedOrAssumed = false
            newItem.domesticOrAbroad = ""
            newItem.taxonSearchString = ""
            newItem.basisOfAssessment = []
            newItem.interactionTypes = []

            // newItem.taxonSearchResult.replace([])
            // newItem.taxonSearchWaitingForResult = false
        }
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

        createTaxonSearch(this.newSSITS, evaluationContext, tax => !!tax.rlCategory && tax.existsInCountry)
        // createTaxonSearch(this.newSSIDS, "N")
        createTaxonSearch(this.newGTD, evaluationContext, tax => tax.existsInCountry)

        createTaxonSearch(this.newHPI, evaluationContext, tax => tax.existsInCountry)


    }

    render() {
        const {appState:{assessment:{riskAssessment}}, appState, evaluationContext} = this.props;
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
        return(
            <div>
                {config.showPageHeaders ? <h3>Økologisk effekt</h3> : <br />}
                <fieldset className="well">
                    <h4>{labels.DEcrit.heading}</h4>
                    <p>Beskriv artens interaksjon(er) med stedegne arter. Det skal være sannsynlighetsovervekt for interaksjonen</p>
                    <SpeciesSpeciesTable list={riskAssessment.speciesSpeciesInteractions} newItem={this.newSSITS} addNewItem={this.addSSITS} koder={koder} labels={labels} showRedlist showKeyStoneSpecie showEffect showInteractionType showConfirmedOrAssumed/>
                    
                    
                    <hr/>
                    <SpeciesNaturetypeTable list={riskAssessment.speciesNaturetypeInteractions} newItem={this.newSNITS} addNewItem={this.addSNITS}  koder={koder} labels={labels} naturtypeLabels={appState.naturtypeLabels } showKeyStoneSpecie showEffect showInteractionType />

                    <hr/>

                    <Xcomp.HtmlString observableValue={[riskAssessment, 'speciesSpeciesInteractionsSupplementaryInformation']} label="Utfyllende informasjon (hvilke(n) artsgruppe i naturtypen påvirkes og hvordan blir disse generelt påvirket):" />

                    <hr/>
                    <Criterion criterion={crit52D} hideInfo={true} />
                    <p>{ntLabels.score}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresD}
                                firstValue={"scoreC"}
                                secondValue={"unsureC"}/>
                     <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "DCritInsecurity"]}
                                label={labels.DEcrit.insecurity}
                            />                      
                   
                    <Criterion criterion={crit52E} hideInfo={true} />

                    <p>{ntLabels.score}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresE}
                                firstValue={"scoreC"}
                                secondValue={"unsureC"}/>
                     <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "ECritInsecurity"]}
                                label={labels.DEcrit.insecurity}
                            />                      
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={crit52F} />
                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresF}
                                firstValue={"scoreF"}
                                secondValue={"unsureF"}/>
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={crit52G} />
                    <p>{ntLabels.scoreSummary}</p>
                    <ScoreUnsure appState={appState}
                                critScores={koder.scoresG}
                                firstValue={"scoreG"}
                                secondValue={"unsureG"}/>
                </fieldset> 
                <fieldset className="well">
                    <h4>{crit52H.heading}</h4>
                    <p>{crit52H.info}</p>
                    <SpeciesSpeciesTable list={riskAssessment.geneticTransferDocumented} newItem={this.newGTD} addNewItem={this.addGTD} koder={koder} labels={labels} showKeyStoneSpecie showConfirmedOrAssumed />
                    <hr/>
                    {crit52H.majorUncertainty ?
                    <div>
                        <span>Beskrivelse</span>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'geneticTransferDomesticDescription']} />
                    </div> : 
                    null}
                    <Criterion criterion={crit52H} mode="noheading"/>
                    {/*<p>HGeneticTransferLevel: {riskAssessment.HGeneticTransferLevel}</p>*/}
                </fieldset>
                <fieldset className="well">
                    <h4>{crit52I.heading} </h4>
                    <p>{crit52I.info}</p>
                    <HostParasiteTable list={riskAssessment.hostParasiteInformations} newItem={this.newHPI} addNewItem={this.addHPI} koder={koder} labels={labels} showKeyStoneSpecie />
                    <hr/>
                    {crit52I.majorUncertainty ?
                    <div>
                        <span>Beskrivelse</span>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'vectorBiologicalDiseaseSpreadingDomesticDescription']} />
                    </div> : 
                    null }
                    <Criterion criterion={crit52I} mode="noheading"/>
                </fieldset>
            </div>
        );
    }
}

                // Vurdering52Okologiskeffekt.propTypes = {
                //     viewModel: PropTypes.object.isRequired,
                //     riskAssessment: PropTypes.object.isRequired
                // }



import React from 'react';
import {observer, inject} from 'mobx-react';
import {action, extendObservable, runInAction, toJS} from 'mobx'
import config from '../../config';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import SpeciesSpeciesTable from './52Okologiskeffekt/SpeciesSpeciesTable'
import SpeciesNaturetypeTable from './52Okologiskeffekt/SpeciesNaturetypeTable'
import HostParasiteTable from './52Okologiskeffekt/HostParasiteTable'
import createTaxonSearch from '../createTaxonSearch'
// const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 
@inject("appState")
@observer
export default class Assessment62Okologiskeffekt extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment}, appState:{assessment:{riskAssessment}}, appState} = this.props;
        const evaluationContext = appState.evaluationContext
        const labels = appState.codeLabels
        const koder = appState.koder

        // ------------------------------------
        // SpeciesSpeciesInteractions (addnewitem)
        // ------------------------------------
        extendObservable(this, {
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
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }
        })
        createTaxonSearch(this.newSSITS, evaluationContext, tax => tax.rlCategory != null )
        this.addSSITS = action(() => {
            const list = riskAssessment.speciesSpeciesInteractions //ThreatenedSpecies;
            const newItem = this.newSSITS;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            list.push(clone)

            // reset the 'new'item
            newItem.scientificName = ""
            newItem.scientificNameId = ""
            newItem.scientificNameAuthor = ""
            newItem.vernacularName = ""
            newItem.taxonRank = ""
            newItem.taxonId = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
            newItem.interactionType = "CompetitionSpace" 
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

        // ------------------------------------
        // GeneticTransferDocumented (addnewitem)
        // ------------------------------------
        extendObservable(this, {
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
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }
        })
        createTaxonSearch(this.newGTD, evaluationContext, tax => tax.rlCategory != null )
        this.addGTD = () => {
            const list = riskAssessment.geneticTransferDocumented;
            const newItem = this.newGTD;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            list.push(clone)

            // reset the 'new'item
            newItem.scientificName = ""
            newItem.scientificNameId = ""
            newItem.scientificNameAuthor = ""
            newItem.vernacularName = ""
            newItem.taxonRank = ""
            newItem.taxonId = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
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

        // ------------------------------------
        // HostParasiteInformations (addnewitem)
        // ------------------------------------
        extendObservable(this, {
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
            }
        })
        createTaxonSearch(this.newHPI, evaluationContext, tax => tax.rlCategory != null )
        this.addHPI = () => {
            const list = riskAssessment.hostParasiteInformations;
            const newItem = this.newHPI;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            list.push(clone)

            // reset the 'new'item
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

        // ------------------------------------
        // SpeciesNaturetypeInteractions (addnewitem)
        // ------------------------------------
        extendObservable(this, {
            newSNITS: {
                id: "newSpeciesNaturetypeInteractionsTaxonSearch",
                niNVariation: [],
                niNCode : "",
                naturetypes: [],
                name: "",
                redListCategory: "", 
                domesticOrAbroad : "",
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                scale: "Limited",
                effect : "Weak",
                interactionType : "CompetitionSpace", 
                longDistanceEffect : false, 
                confirmedOrAssumed : false,                
                basisOfAssessment: [],
                interactionTypes: [],
            } 
        })
        this.addSNITS = action(() => {
            const list = riskAssessment.speciesNaturetypeInteractions //ThreatenedSpecies;
            const newItem = this.newSNITS;
            const clone = toJS(newItem);
            console.log("Clone: " + JSON.stringify(clone))
            const name = assessment.impactedNatureTypes.find(element => element.niNCode == clone.niNCode).name;
            clone.name = name;
            list.push(clone)

            // reset the 'new'item
            newItem.niNVariation.clear(),
            newItem.name = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
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
        })
        // ------------------------------------
    }

    render() {
        const {appState:{assessment}, appState:{assessment:{riskAssessment}}, appState, evaluationContext} = this.props;
        const labels = appState.codeLabels
        const koder = appState.koder
        const nbsp = "\u00a0"
        const critD = riskAssessment.critD
        const critE = riskAssessment.critE
        const critF = riskAssessment.critF
        const critG = riskAssessment.critG
        const critH = riskAssessment.critH
        const critI = riskAssessment.critI
        const ntLabels = labels.NatureTypes

        // console.log(this.newSSITS.taxonSearchResult)
        return(
            <div>

                {config.showPageHeaders 
                ? <h3>Økologisk effekt</h3> 
                : <br />}
                <fieldset className="well">
                    <h2>{labels.DEcrit.mainHeading}</h2>
                    <h4>{labels.DEcrit.heading}</h4>
                    <p>Beskriv artens interaksjon(er) med stedegne og andre arter som har blitt vurdert for rødlisting.</p>
                    <hr/>
                    <SpeciesSpeciesTable 
                        list={riskAssessment.speciesSpeciesInteractions} 
                        newItem={this.newSSITS} 
                        addNewItem={this.addSSITS} 
                        koder={koder} 
                        labels={labels} 
                        disabled={appState.userContext.readonly} 
                        showRedlist 
                        showKeyStoneSpecie 
                        showEffect 
                        showInteractionType 
                        showConfirmedOrAssumed/>
                    <hr/>
                    <p>Legg til grupper av arter</p>
                    <SpeciesNaturetypeTable 
                        list={riskAssessment.speciesNaturetypeInteractions} 
                        natureTypes={assessment.impactedNatureTypes} 
                        newItem={this.newSNITS} 
                        addNewItem={this.addSNITS}  
                        koder={koder} 
                        labels={labels} 
                        disabled={appState.userContext.readonly} 
                        naturtypeLabels={appState.naturtypeLabels } 
                        showKeyStoneSpecie 
                        showEffect 
                        showInteractionType />
                    <br>
                    </br>
                    <Xcomp.HtmlString observableValue={[riskAssessment, 'speciesSpeciesInteractionsSupplementaryInformation']} label="Utfyllende informasjon (f.eks. hvilke(n) artsgruppe i naturtypen påvirkes og hvordan blir disse generelt påvirket):" />
                    {riskAssessment.speciesNaturetypeInteractions2018.length > 0 
                    ? <div class="previousAssessment">
                        <h4>{ntLabels.dataFromPreviousAssessment}</h4>
                        <SpeciesNaturetypeTable 
                            list={riskAssessment.speciesNaturetypeInteractions2018} 
                            natureTypes={assessment.impactedNatureTypesFrom2018} 
                            koder={koder} 
                            labels={labels} 
                            disabled={true} 
                            naturtypeLabels={appState.naturtypeLabels } 
                            showKeyStoneSpecie 
                            showEffect 
                            showInteractionType />
                    </div>
                    : null}
                    <hr/>
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={critD} hideInfo={true} disabled={appState.userContext.readonly}/>
                    <Xcomp.HtmlString observableValue={[riskAssessment, "dCritInsecurity"]} label={labels.DEcrit.insecurity}/>                      
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={critE} hideInfo={true} disabled={appState.userContext.readonly}/>
                    <Xcomp.HtmlString observableValue={[riskAssessment, "eCritInsecurity"]} label={labels.DEcrit.insecurity}/>                      
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={critF} disabled={true}/>
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={critG} disabled={true}/>
                </fieldset> 
                <fieldset className="well">
                    <h4>{critH.heading}</h4>
                    <p>{critH.info}</p>
                    <br></br>
                    <SpeciesSpeciesTable 
                        list={riskAssessment.geneticTransferDocumented} 
                        newItem={this.newGTD} 
                        addNewItem={this.addGTD} 
                        koder={koder} 
                        labels={labels} 
                        disabled={appState.userContext.readonly} 
                        showKeyStoneSpecie 
                        showInteractionType 
                        showConfirmedOrAssumed 
                        HCrit />
                    <hr/>
                    <Criterion criterion={critH} mode="noheading" disabled={appState.userContext.readonly}/>
                    <Xcomp.HtmlString observableValue={[riskAssessment, "hCritInsecurity"]} label={labels.DEcrit.insecurity}/>
                </fieldset>
                <fieldset className="well">
                    <h4>{critI.heading} </h4>
                    <p>{critI.info}</p>
                    <HostParasiteTable 
                        list={riskAssessment.hostParasiteInformations} 
                        newItem={this.newHPI} 
                        addNewItem={this.addHPI} 
                        koder={koder} 
                        labels={labels} 
                        disabled={appState.userContext.readonly} 
                        showKeyStoneSpecie />
                    <hr/>
                    <Criterion criterion={critI} mode="noheading" disabled={appState.userContext.readonly}/>
                    <Xcomp.HtmlString observableValue={[riskAssessment, "iCritInsecurity"]} label={labels.DEcrit.insecurity}/>                      
                </fieldset>
            </div>
        );
    }
}



